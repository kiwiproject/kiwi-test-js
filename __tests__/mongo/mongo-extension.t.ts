import { describe, it, expect, afterEach } from "@jest/globals";
import { MongoExtension } from "../../src";
import { MongoClient } from "mongodb";

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
    }, 10_000);
  });

  describe("stopMongoContainer", () => {
    it("should stop the mongo container", async () => {
      await MongoExtension.startMongoContainer();
      await MongoExtension.stopMongoContainer();

      expect(global.MONGO_CONTAINER).toBeUndefined();
    }, 10_000);

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
    }, 10_000);

    it("should throw error when container is not previously started", () => {
      expect(() => MongoExtension.getMongoBaseUrl()).toThrow(
        "IllegalStateException: Mongo container has not been previously started",
      );
    });
  });

  describe("clearDatabase", () => {
    it("should drop all collections in the database", async () => {
      await MongoExtension.startMongoContainer();

      const url = MongoExtension.getMongoBaseUrl();

      const client = new MongoClient(url);
      const db = client.db("kiwi");

      await db.createCollection("collection1");
      await db.createCollection("collection2");

      const collections = await db.collections();
      expect(collections).toHaveLength(2);

      await MongoExtension.clearDatabase("kiwi");

      const collectionsAfterClear = await db.collections();
      expect(collectionsAfterClear).toHaveLength(0);

      await client.close(true);
    }, 10_000);

    it("should throw error when container is not previously started", () => {
      expect(MongoExtension.clearDatabase("kiwi")).rejects.toEqual(
        Error(
          "IllegalStateException: Mongo container has not been previously started",
        ),
      );

      expect(global.MONGO_CONTAINER).toBeUndefined();
    });
  });
});
