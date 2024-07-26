const { AuctionSystem, Bidder, Bid } = require("./auctionSystemTest");

describe("Auction System", () => {
  let auction;

  beforeEach(() => {
    auction = new AuctionSystem();
  });

  test("should handle tie-breaking rules correctly", () => {
    auction.addItem("item1", 100);

    const bidderA = new Bidder("A", 5, 4.5);
    const bidderB = new Bidder("B", 9, 2.94);

    auction.placeBid(bidderA, "item1", 170, 1000);
    auction.placeBid(bidderB, "item1", 160, 1000);

    const assignments = auction.assignItems();

    expect(assignments.get("item1").bidder.id).toBe("A");
  });

  test("should assign item to bidder with highest score", () => {
    auction.addItem("item1", 100);

    const bidderA = new Bidder("A", 5, 4.5);
    const bidderB = new Bidder("B", 10, 4.5);

    auction.placeBid(bidderA, "item1", 150, 1000);
    auction.placeBid(bidderB, "item1", 150, 1100);

    const assignments = auction.assignItems();

    expect(assignments.get("item1").bidder.id).toBe("B");
  });

  test("should assign remaining items to highest scoring eligible bidder", () => {
    auction.addItem("item1", 100);
    auction.addItem("item2", 50);

    const bidderA = new Bidder("A", 10, 4.5);
    const bidderB = new Bidder("B", 10, 3.3236);

    auction.placeBid(bidderA, "item1", 170, 1000);
    auction.placeBid(bidderB, "item1", 160, 1100);
    auction.placeBid(bidderA, "item2", 60, 1200);

    const assignments = auction.assignItems();

    expect(assignments.get("item1").bidder.id).toBe("B");
    expect(assignments.get("item2").bidder.id).toBe("A");
  });

  test("should handle multiple bids from a single bidder correctly", () => {
    auction.addItem("item1", 100);

    const bidderA = new Bidder("A", 5, 4.5);

    auction.placeBid(bidderA, "item1", 150, 1000);
    auction.placeBid(bidderA, "item1", 160, 1100);

    const assignments = auction.assignItems();

    expect(assignments.get("item1").bidder.id).toBe("A");
    expect(assignments.get("item1").amount).toBe(160);
  });

  test("should throw an error if the bid amount is negative", () => {
    auction.addItem("item1", 100);
    const bidderA = new Bidder("A", 5, 4.5);

    expect(() => {
      auction.placeBid(bidderA, "item1", -10, Date.now());
    }).toThrow("Bid amount cannot be negative");
  });

  test("should throw an error if the bid amount is less than the reserve price", () => {
    auction.addItem("item1", 100);
    const bidderA = new Bidder("A", 5, 4.5);

    expect(() => {
      auction.placeBid(bidderA, "item1", 50, Date.now());
    }).toThrow("Bid amount cannot be less than the reserve price of 100");
  });

  test("should not throw an error if the bid amount is equal to the reserve price", () => {
    auction.addItem("item1", 100);
    const bidderA = new Bidder("A", 5, 4.5);

    expect(() => {
      auction.placeBid(bidderA, "item1", 100, Date.now());
    }).not.toThrow();
  });

  test("should not throw an error if the bid amount is greater than the reserve price", () => {
    auction.addItem("item1", 100);
    const bidderA = new Bidder("A", 5, 4.5);

    expect(() => {
      auction.placeBid(bidderA, "item1", 150, Date.now());
    }).not.toThrow();
  });

  test("should handle multiple bidders and listings, including a listing with no bidders", () => {
    auction.addItem("item1", 100);
    auction.addItem("item2", 200);
    auction.addItem("item3", 300);
    auction.addItem("item4", 400);
    auction.addItem("item5", 500);
    auction.addItem("item6", 600); // No bidders for this item

    const bidderA = new Bidder("A", 5, 4.5);
    const bidderB = new Bidder("B", 10, 4.2);
    const bidderC = new Bidder("C", 7, 4.8);
    const bidderD = new Bidder("D", 3, 3.5);
    const bidderE = new Bidder("E", 8, 4.9);

    auction.placeBid(bidderA, "item1", 150, 1000);
    auction.placeBid(bidderB, "item2", 250, 1100);
    auction.placeBid(bidderC, "item3", 350, 1200);
    auction.placeBid(bidderD, "item4", 450, 1300);
    auction.placeBid(bidderE, "item5", 550, 1400);

    const assignments = auction.assignItems();

    expect(assignments.get("item1").bidder.id).toBe("A");
    expect(assignments.get("item2").bidder.id).toBe("B");
    expect(assignments.get("item3").bidder.id).toBe("C");
    expect(assignments.get("item4").bidder.id).toBe("D");
    expect(assignments.get("item5").bidder.id).toBe("E");
    expect(assignments.has("item6")).toBe(false); // No bidder for item6
  });
});
