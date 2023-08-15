import {afterEach, describe, expect, it} from "@jest/globals";
import {MongoExtension} from "../../src";

describe("MongoExtension", () => {
  afterEach(async () => {
    if (global.MONGO_CONTAINER) {
      await global.MONGO_CONTAINER.stop();
      global.MONGO_CONTAINER = undefined;
    }
  });

  describe("startMongoContainer", () => {
    it("should start the mongo container", async () => {
      await MongoExtension.startMongoContainer();

      expect(global.MONGO_CONTAINER).toBeDefined();

      await global.MONGO_CONTAINER.stop();
    }, 60_000);
  });

  describe("stopMongoContainer", () => {
    it("should stop the mongo container", async () => {
      await MongoExtension.startMongoContainer();
      await MongoExtension.stopMongoContainer();

      expect(global.MONGO_CONTAINER).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(MongoExtension.stopMongoContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Mongo container has not been previously started",
        ),
      );

      expect(global.MONGO_CONTAINER).toBeUndefined();
    });
  });

  describe("getMongoBaseUrl", () => {
    it("should return the base url for the started container", async () => {
      await MongoExtension.startMongoContainer();

      const url = MongoExtension.getMongoBaseUrl();
      expect(url).toContain("mongodb://localhost:");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => MongoExtension.getMongoBaseUrl()).toThrow(
        "IllegalStateException: Mongo container has not been previously started",
      );
    });
  });

  describe("getMongoUriWithDb", () => {
    it("should return the base url with the given db for the started container", async () => {
      await MongoExtension.startMongoContainer();

      const url = MongoExtension.getMongoUriWithDb("kiwi");
      expect(url).toContain("mongodb://localhost:");
      expect(url).toContain("/kiwi");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => MongoExtension.getMongoUriWithDb("kiwi")).toThrow(
        "IllegalStateException: Mongo container has not been previously started",
      );
    });
  });
});
