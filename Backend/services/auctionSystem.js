const { startOfDay, endOfDay } = require("date-fns");

class AuctionSystem {
  constructor(prisma) {
    this.prisma = prisma;
    this.bids = [];
    this.items = new Map();
    this.assignments = new Map();
  }

  calculateBidScore(bid) {
    const maxBid = Math.max(
      ...this.bids.filter((b) => b.itemId === bid.itemId).map((b) => b.amount)
    );
    const normalizedBid = maxBid > 0 ? bid.amount / maxBid : 0;
    const userBidsForTheDay = this.bids.filter(
      (b) => b.bidder.id === bid.bidder.id
    ).length;
    const normalizedBidsPerDay = Math.min(userBidsForTheDay / 10, 1);
    const normalizedTime = (Date.now() / 1000 - bid.timestamp) / 86400;

    const score =
      0.3 * normalizedBid +
      0.2 * (bid.bidder.pastPurchases / 10) +
      0.3 * (bid.bidder.rating / 5) +
      0.1 * (1 - normalizedTime) +
      0.1 * (1 - normalizedBidsPerDay);
    return score;
  }

  assignItems() {
    const itemBids = new Map(
      [...this.items.keys()].map((itemId) => [itemId, []])
    );
    for (const bid of this.bids) {
      itemBids.get(bid.itemId).push(bid);
    }

    const assignments = new Map();
    const assignedBidders = new Set();
    const assignedItems = new Set();

    // First pass: Assign items with only one bid
    for (const [itemId, bids] of itemBids) {
      if (bids.length === 1 && bids[0].amount >= this.items.get(itemId)) {
        assignments.set(itemId, bids[0]);
        assignedBidders.add(bids[0].bidder.id);
        assignedItems.add(itemId);
      }
    }

    // Second pass: Assign remaining items
    for (const [itemId, bids] of itemBids) {
      if (assignments.has(itemId)) continue;

      const eligibleBids = bids.filter(
        (bid) =>
          !assignedBidders.has(bid.bidder.id) &&
          bid.amount >= this.items.get(itemId)
      );

      if (eligibleBids.length === 0) continue;

      const uniqueBidders = eligibleBids.filter(
        (bid) =>
          !this.bids.some(
            (otherBid) =>
              otherBid.bidder.id === bid.bidder.id &&
              otherBid.itemId !== itemId &&
              !assignedItems.has(otherBid.itemId)
          )
      );

      let winningBid;
      if (uniqueBidders.length === 1) {
        winningBid = uniqueBidders[0];
      } else if (uniqueBidders.length > 1) {
        winningBid = this.getHighestScoringBid(uniqueBidders);
      } else {
        winningBid = this.getHighestScoringBid(eligibleBids);
      }

      assignments.set(itemId, winningBid);
      assignedBidders.add(winningBid.bidder.id);
      assignedItems.add(itemId);
    }
    this.assignments = assignments;
    return assignments;
  }

  getAssignments() {
    return this.assignments;
  }

  getHighestScoringBid(bids) {
    return bids.reduce((max, bid) => {
      const scoreA = this.calculateBidScore(max);
      const scoreB = this.calculateBidScore(bid);

      if (scoreB !== scoreA) {
        return scoreB > scoreA ? bid : max;
      }
      // Tie-breaking rules
      if (bid.amount !== max.amount) {
        return bid.amount > max.amount ? bid : max;
      }
      if (bid.bidder.rating !== max.bidder.rating) {
        return bid.bidder.rating > max.bidder.rating ? bid : max;
      }
      if (bid.bidder.pastPurchases !== max.bidder.pastPurchases) {
        return bid.bidder.pastPurchases > max.bidder.pastPurchases ? bid : max;
      }
      return bid.timestamp < max.timestamp ? bid : max;
    });
  }

  async saveAssignments(assignments) {
    for (const [itemId, winningBid] of assignments) {
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
          paymentIntentId: "AUCTION_WIN",
        },
      });
    }
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

    for (const auction of endingAuctions) {
      this.items.set(auction.id, parseFloat(auction.initialBid));
      for (const bid of auction.bids) {
        const user = await this.prisma.user.findUnique({
          where: { id: bid.user.id },
          select: {
            id: true,
            averageRating: true,
            _count: {
              select: { transactions: true },
            },
          },
        });
        this.bids.push(
          new Bid(
            new Bidder(user.id, user._count.transactions, user.averageRating),
            auction.id,
            parseFloat(bid.amount),
            bid.createdAt.getTime() / 1000
          )
        );
      }
    }

    // process all auctions together
    const assignments = this.assignItems();

    // Save assignments and update unsold auctions
    await this.saveAssignments(assignments);

    for (const auction of endingAuctions) {
      if (!assignments.has(auction.id)) {
        await this.prisma.listing.update({
          where: { id: auction.id },
          data: { status: "unsold" },
        });
      }
    }
    return endingAuctions.length;
  }
}

class Bidder {
  constructor(id, pastPurchases, rating) {
    this.id = id;
    this.pastPurchases = pastPurchases;
    this.rating = rating;
  }
}

class Bid {
  constructor(bidder, itemId, amount, timestamp) {
    this.bidder = bidder;
    this.itemId = itemId;
    this.amount = amount;
    this.timestamp = timestamp;
  }
}

module.exports = { AuctionSystem, Bidder, Bid };
