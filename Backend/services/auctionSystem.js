const { startOfDay, endOfDay } = require("date-fns");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class AuctionSystem {
  constructor(prisma) {
    this.prisma = prisma;
    this.bids = [];
    this.items = new Map();
    this.assignments = new Map();
  }

  calculateBidScore(bid) {
    const itemBids = this.bids.filter((b) => b.itemId === bid.itemId);
    const maxBid = Math.max(...itemBids.map((b) => b.amount));
    const normalizedBid = maxBid > 0 ? bid.amount / maxBid : 0;
    const userBidsForTheDay = this.bids.filter(
      (b) => b.bidder.id === bid.bidder.id
    ).length;
    const normalizedBidsPerDay = Math.min(userBidsForTheDay / 10, 1);
    const minTimestamp = Math.min(...this.bids.map((b) => b.timestamp));
    const maxTimestamp = Math.max(...this.bids.map((b) => b.timestamp));
    const normalizedTime =
      (bid.timestamp - minTimestamp) / (maxTimestamp - minTimestamp || 1);

    const score =
      0.5 * normalizedBid +
      0.2 * Math.min(bid.bidder.pastPurchases / 10, 1) +
      0.3 * (bid.bidder.rating / 5) +
      0.0 * (1 - normalizedTime) +
      0.0 * (1 - normalizedBidsPerDay);

    // Round to 4 decimal places
    return Math.round(score * 10000) / 10000;
  }

  assignItems() {
    const itemBids = new Map(
      [...this.items.keys()].map((itemId) => [itemId, []])
    );

    const usersHighestScoringBidsPerItem = this.bids.reduce((acc, bid) => {
      const bidScore = this.calculateBidScore(bid);
      const existingBidIndex = acc.findIndex(
        (b) => b.bidder.id === bid.bidder.id && b.itemId === bid.itemId
      );
      if (
        existingBidIndex === -1 ||
        this.calculateBidScore(acc[existingBidIndex]) < bidScore
      ) {
        if (existingBidIndex !== -1) {
          acc.splice(existingBidIndex, 1);
        }
        acc.push(bid);
      }
      return acc;
    }, []);

    for (const bid of usersHighestScoringBidsPerItem) {
      itemBids.get(bid.itemId).push(bid);
    }

    const assignments = new Map();
    const assignedBidders = new Set();
    let unassignedItems = new Set(this.items.keys());

    const pq = new PriorityQueue((a, b) => {
      const scoreA = this.calculateBidScore(a);
      const scoreB = this.calculateBidScore(b);

      if (scoreA !== scoreB) {
        return scoreA > scoreB;
      }
      return this.compareBids(a, b) > 0;
    });

    // First pass: Assign items with only one bid
    for (const [itemId, bids] of itemBids) {
      if (bids.length === 1) {
        const winningBid = bids[0];
        assignments.set(itemId, winningBid);
        assignedBidders.add(winningBid.bidder.id);
        unassignedItems.delete(itemId);
      }
    }

    // Helper function to find unique bidders for an item
    const findUniqueBidders = (itemId) => {
      return itemBids
        .get(itemId)
        .filter(
          (bid) =>
            !assignedBidders.has(bid.bidder.id) &&
            [...itemBids.entries()].every(
              ([otherItemId, otherBids]) =>
                otherItemId === itemId ||
                !otherBids.some(
                  (otherBid) => otherBid.bidder.id === bid.bidder.id
                )
            )
        );
    };

    // Second pass: Assign items to unique bidders
    let changed;
    do {
      changed = false;
      for (const itemId of unassignedItems) {
        const uniqueBidders = findUniqueBidders(itemId);

        if (uniqueBidders.length === 1) {
          const winningBid = uniqueBidders[0];
          assignments.set(itemId, winningBid);
          assignedBidders.add(winningBid.bidder.id);
          unassignedItems.delete(itemId);
          changed = true;
        } else if (uniqueBidders.length > 1) {
          pq.clear();
          for (const bid of uniqueBidders) {
            pq.push(bid);
          }
          const winningBid = pq.pop();
          assignments.set(itemId, winningBid);
          assignedBidders.add(winningBid.bidder.id);
          unassignedItems.delete(itemId);
          changed = true;
        }
      }
    } while (changed);

    // Third pass: Assign remaining items to highest scoring eligible bidder
    for (const itemId of unassignedItems) {
      pq.clear();
      const eligibleBids = itemBids
        .get(itemId)
        .filter((bid) => !assignedBidders.has(bid.bidder.id));

      for (const bid of eligibleBids) {
        pq.push(bid);
      }

      if (!pq.isEmpty()) {
        const winningBid = pq.pop();
        assignments.set(itemId, winningBid);
        assignedBidders.add(winningBid.bidder.id);
      }
    }

    this.assignments = assignments;
    return assignments;
  }

  getAssignments() {
    return this.assignments;
  }
  compareBids(a, b) {
    if (a.amount !== b.amount) {
      return a.amount - b.amount;
    }
    if (a.bidder.rating !== b.bidder.rating) {
      return a.bidder.rating - b.bidder.rating;
    }
    if (a.bidder.pastPurchases !== b.bidder.pastPurchases) {
      return a.bidder.pastPurchases - b.bidder.pastPurchases;
    }
    return b.timestamp - a.timestamp;
  }

  async saveAssignments(assignments) {
    const promises = [];
    for (const [itemId, winningBid] of assignments) {
      // Confirm the payment intent for the winning bid
      promises.push(
        (async () => {
          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: winningBid.amount * 100,
              currency: "usd",
              customer: winningBid.bidder.stripeCustomerId,
              payment_method: winningBid.paymentMethodId,
              use_stripe_sdk: true,
              off_session: true,
              confirm: true,
              payment_method_types: ["card"],
            });

            if (paymentIntent.status === "succeeded") {
              await this.prisma.listing.update({
                where: { id: itemId },
                data: {
                  status: "sold",
                  currentBid: winningBid.amount,
                },
              });

              await this.prisma.transaction.create({
                data: {
                  listingId: itemId,
                  buyerId: winningBid.bidder.id,
                  paymentIntentId: paymentIntent.id,
                },
              });
            } else {
              console.error(`Payment for auction ${itemId} did not succeed.`);
            }
          } catch (error) {
            console.error(
              `Error confirming payment intent for auction ${itemId}:`,
              error
            );
          }
        })()
      );
    }
    await Promise.all(promises);
  }

  async processEndingAuctions() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const endingAuctions = await this.prisma.listing.findMany({
      where: {
        isAuction: true,
        status: "active",
        auctionEndTime: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      include: {
        bids: {
          include: {
            user: true,
          },
        },
      },
    });

    // Load all auction data at once
    this.items.clear();
    this.bids = [];

    const userPromises = endingAuctions.flatMap((auction) =>
      auction.bids.map((bid) =>
        this.prisma.user.findUnique({
          where: { id: bid.user.id },
          select: {
            id: true,
            averageRating: true,
            stripeCustomerId: true,
            _count: {
              select: { transactions: true },
            },
          },
        })
      )
    );

    const users = await Promise.all(userPromises);

    const userMap = new Map(users.map((user) => [user.id, user]));

    for (const auction of endingAuctions) {
      this.items.set(auction.id, parseFloat(auction.initialBid));
      for (const bid of auction.bids) {
        const user = userMap.get(bid.user.id);
        this.bids.push(
          new Bid(
            new Bidder(
              user.id,
              user._count.transactions,
              user.averageRating,
              user.stripeCustomerId
            ),
            auction.id,
            parseFloat(bid.amount),
            bid.createdAt.getTime() / 1000,
            bid.paymentMethodId
          )
        );
      }
    }

    // process all auctions together
    const assignments = this.assignItems();

    // Save assignments and update unsold auctions
    await this.saveAssignments(assignments);

    const unsoldUpdates = endingAuctions
      .filter((auction) => !assignments.has(auction.id))
      .map((auction) =>
        this.prisma.listing.update({
          where: { id: auction.id },
          data: { status: "unsold" },
        })
      );

    await Promise.all(unsoldUpdates);
    return endingAuctions.length;
  }
}

class Bidder {
  constructor(id, pastPurchases, rating, stripeCustomerId) {
    this.id = id;
    this.pastPurchases = pastPurchases;
    this.rating = rating;
    this.stripeCustomerId = stripeCustomerId;
  }
}

class Bid {
  constructor(bidder, itemId, amount, timestamp, paymentMethodId) {
    this.bidder = bidder;
    this.itemId = itemId;
    this.amount = amount;
    this.timestamp = timestamp;
    this.paymentMethodId = paymentMethodId;
  }
}

class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this.heap = [];
    this.comparator = comparator;
  }

  push(value) {
    this.heap.push(value);
    this._siftUp();
    return this.size();
  }

  pop() {
    if (this.size() > 1) {
      this._swap(0, this.size() - 1);
    }
    const poppedValue = this.heap.pop();
    this._siftDown();
    return poppedValue;
  }

  peek() {
    return this.heap[0];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  clear() {
    this.heap = [];
  }

  _parent(index) {
    return Math.floor((index - 1) / 2);
  }

  _leftChild(index) {
    return 2 * index + 1;
  }

  _rightChild(index) {
    return 2 * index + 2;
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  _compare(i, j) {
    return this.comparator(this.heap[i], this.heap[j]);
  }

  _siftUp() {
    let nodeIndex = this.size() - 1;
    while (nodeIndex > 0 && this._compare(nodeIndex, this._parent(nodeIndex))) {
      this._swap(nodeIndex, this._parent(nodeIndex));
      nodeIndex = this._parent(nodeIndex);
    }
  }

  _siftDown() {
    let nodeIndex = 0;
    while (
      (this._leftChild(nodeIndex) < this.size() &&
        this._compare(this._leftChild(nodeIndex), nodeIndex)) ||
      (this._rightChild(nodeIndex) < this.size() &&
        this._compare(this._rightChild(nodeIndex), nodeIndex))
    ) {
      const maxChildIndex =
        this._rightChild(nodeIndex) < this.size() &&
        this._compare(this._rightChild(nodeIndex), this._leftChild(nodeIndex))
          ? this._rightChild(nodeIndex)
          : this._leftChild(nodeIndex);
      this._swap(nodeIndex, maxChildIndex);
      nodeIndex = maxChildIndex;
    }
  }
}

module.exports = { AuctionSystem, Bidder, Bid };
