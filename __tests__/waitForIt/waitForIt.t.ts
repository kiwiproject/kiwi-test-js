import { describe, expect, it } from "@jest/globals";
import { wait } from "../../src";

describe("Awaitility", () => {
  it("should resolve when condition passes", () => {
    wait().until(() => true);
  });

  it("should reject when condition runs out of tries", async () => {
    await expect(wait().until(() => false)).rejects.toEqual(
      new Error("Condition was not met after 5 tries"),
    );
  });

  it("should allow for setting the wait time", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 2 tries"));
  });

  it("should allow for setting the interval check time", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .checkEvery(10, "ms")
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));
  });
});
