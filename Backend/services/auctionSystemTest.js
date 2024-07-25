class AuctionSystem {
  constructor() {
    this.bids = [];
    this.items = new Map();
  }

  addItem(itemId, reservePrice) {
    this.items.set(itemId, reservePrice);
  }

  placeBid(bidder, itemId, amount, timestamp) {
    if (!this.items.has(itemId)) {
      throw new Error(`Item ${itemId} does not exist`);
    }
    this.bids.push(new Bid(bidder, itemId, amount, timestamp));
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

      if (existingBidIndex === -1) {
        acc.push(bid);
      } else {
        const existingBid = acc[existingBidIndex];
        const existingScore = this.calculateBidScore(existingBid);

        if (
          bidScore > existingScore ||
          (bidScore === existingScore && this.compareBids(bid, existingBid) > 0)
        ) {
          acc[existingBidIndex] = bid;
        }
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

function runComplexAuctionSimulation() {
  const auction = new AuctionSystem();

  // Add two items to the auction
  auction.addItem("item1", 100); // Normal reserve

  // Create bidders with manipulated profiles
  const bidderA = new Bidder("A", 5, 4.5); // Moderate purchases, high rating
  const bidderB = new Bidder("B", 10, 3.3236); // High purchases, moderate rating

  // Place bids and log scores
  function placeBidAndLogScore(bidder, itemId, amount, timestamp) {
    auction.placeBid(bidder, itemId, amount, timestamp);
  }

  // Bidding scenarios
  // Item 1: Two bids with identical scores
  placeBidAndLogScore(bidderA, "item1", 170, 1000);
  placeBidAndLogScore(bidderB, "item1", 160, 1100);

  // Assign items to winners and resolve any ties
  const assignments = auction.assignItems();

  const unassignedItems = new Set(auction.items.keys());
  for (const [itemId] of assignments) {
    unassignedItems.delete(itemId);
  }
}

// Run the simulation
runComplexAuctionSimulation();
module.exports = { AuctionSystem, Bidder, Bid };
