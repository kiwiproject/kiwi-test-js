import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { wait } from "../../src";

describe("WaitForIt", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should resolve when condition passes", () => {
    wait().until(() => true);
  });

  it("should resolve when condition passes and callback returns a promise", () => {
    wait().until(() => Promise.resolve(true));
  });

  it("should reject when condition runs out of tries", async () => {
    await expect(wait().until(() => false)).rejects.toEqual(
      new Error("Condition was not met after 40 tries"),
    );
  }, 6_000);

  it("should allow for setting the wait time", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 2 tries"));
  });

  it("should allow for setting the wait time defaulting units to ms", async () => {
    await expect(
      wait()
        .atMost(200)
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 2 tries"));
  });

  it("should allow for setting the interval check time", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));
  });

  it("should allow for setting the interval check time defaulting to ms units", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10)
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));
  });

  it("should allow for setting the poll delay time", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .withPollDelay(20, "ms")
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));
  });

  it("should allow for setting the poll delay time defaulting the units to ms", async () => {
    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .withPollDelay(20)
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));
  });

  it("should allow for enabling verbose mode with success messages", async () => {
    const consoleSpy = jest.spyOn(global.console, "log");

    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .withVerbose()
        .until(() => true),
    ).resolves.toEqual("Condition met after 1 of 20 tries");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Waiting for condition for up to 20 attempts checking every 10 ms",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Condition met after 1 of 20 tries",
    );
  });

  it("should allow for enabling verbose mode with failed messages", async () => {
    const consoleSpy = jest.spyOn(global.console, "log");

    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .withVerbose()
        .until(() => false),
    ).rejects.toEqual(new Error("Condition was not met after 20 tries"));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Waiting for condition for up to 20 attempts checking every 10 ms",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Condition was not met after 20 tries",
    );
  });

  it("should allow for adding an alias ", async () => {
    const consoleSpy = jest.spyOn(global.console, "log");

    await expect(
      wait()
        .atMost(200, "ms")
        .withPollInterval(10, "ms")
        .withVerbose()
        .withAlias("KIWI")
        .until(() => true),
    ).resolves.toEqual("Condition with alias KIWI met after 1 of 20 tries");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Waiting for condition with alias KIWI for up to 20 attempts checking every 10 ms",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Condition with alias KIWI met after 1 of 20 tries",
    );
  });
});
