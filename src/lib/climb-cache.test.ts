// SOMNATH-AI: Climb cache tests | ZONE: 0 | PURPOSE: The save action covers all thirteen chants. | CONTRACT: The list is the public chant recordings, nothing else.
import { describe, expect, it } from "vitest";
import { chantUrls } from "./climb-cache";

describe("climb chants", () => {
  it("lists one archive recording for each of the 13 chapters", () => {
    const urls = chantUrls();
    expect(urls).toHaveLength(13);
    expect(urls[0]).toContain("archive.org");
    expect(urls[0]).toContain("chandi-1");
    expect(new Set(urls).size).toBe(13);
  });
});
