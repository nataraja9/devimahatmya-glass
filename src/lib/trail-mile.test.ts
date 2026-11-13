// SOMNATH-AI: Trail mile tests | ZONE: 0 | PURPOSE: Keep Adhkuwari and Bhairon labeled as estimates. | CONTRACT: Step 5 is about 6 km. Bhairon is past 13 km.
import { describe, expect, it } from "vitest";
import { mileTitle } from "./trail-mile";

describe("trail mile labels", () => {
  it("marks Adhkuwari as step 5 at an estimated 6 km", () => {
    expect(mileTitle("Adhkuwari Junction", 5, "Step", "6.0", "Est.", "Est. past 13 km")).toBe("Adhkuwari Junction — Step 5 (Est. 6 km)");
  });
  it("marks Bhaironath as the last step past 13 km", () => {
    expect(mileTitle("Bhaironath Temple Peak", 13, "Step", "13.0+", "Est.", "Est. past 13 km")).toBe("Bhaironath Temple Peak — Step 13 (Est. past 13 km)");
  });
});
