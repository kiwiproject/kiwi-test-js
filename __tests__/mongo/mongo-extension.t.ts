import { afterEach, describe, expect, it } from "@jest/globals";
import { MongoClient } from "mongodb";
import { MongoExtension } from "../../src";

describe("MongoExtension", () => {
  afterEach(async () => {
    if (global.MONGO_CONTAINER) {
      await global.MONGO_CONTAINER.stop();
      global.MONGO_CONTAINER = undefined;
    }

    delete process.env.MONGO_EXTENSION_BASE_URI;
  });

  describe("startMongoContainer", () => {
    it("should start the mongo container", async () => {
      await MongoExtension.startMongoContainer();

      expect(global.MONGO_CONTAINER).toBeDefined();

      expect(process.env.MONGO_EXTENSION_BASE_URI).toEqual(
        `mongodb://${global.MONGO_CONTAINER.getHost()}:${global.MONGO_CONTAINER.getFirstMappedPort()}/`,
      );
    }, 60_000);
  });

  describe("stopMongoContainer", () => {
    it("should stop the mongo container", async () => {
      await MongoExtension.startMongoContainer();
      await MongoExtension.stopMongoContainer();

      expect(global.MONGO_CONTAINER).toBeUndefined();
      expect(process.env.MONGO_EXTENSION_BASE_URI).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(MongoExtension.stopMongoContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Mongo container has not been previously started or is not running in band",
        ),
      );

      expect(global.MONGO_CONTAINER).toBeUndefined();
    });
  });

  describe("setMongoBaseUrl", () => {
    it("should set the uri env variable for the mongo url", () => {
      MongoExtension.setMongoBaseUrl("localhost", 12345);

      expect(process.env.MONGO_EXTENSION_BASE_URI).toEqual(
        "mongodb://localhost:12345/",
      );
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

  describe("dropDatabase", () => {
    it("should drop the given database from mongo", async () => {
      await MongoExtension.startMongoContainer();

      const dbClient = new MongoClient(
        MongoExtension.getMongoUriWithDb("kiwi_drop"),
      );
      await dbClient.connect();
      const kiwiDb = dbClient.db("kiwi_drop");
      await kiwiDb.createCollection("foo");
      await dbClient.close();

      const client = new MongoClient(MongoExtension.getMongoBaseUrl());
      const adminDb = client.db("admin");

      const dbListingBeforeDrop = await adminDb.command({
        listDatabases: 1,
        nameOnly: true,
      });

      const dbNamesBeforeDrop = dbListingBeforeDrop.databases.map(
        (db: { name: string }) => db.name,
      );
      expect(dbNamesBeforeDrop).toContain("kiwi_drop");

      await MongoExtension.dropDatabase("kiwi_drop");

      const dbListingAfterDrop = await adminDb.command({
        listDatabases: 1,
        nameOnly: true,
      });

      const dbNamesAfterDrop = dbListingAfterDrop.databases.map(
        (db: { name: string }) => db.name,
      );
      expect(dbNamesAfterDrop).not.toContain("kiwi_drop");

      await client.close();
    }, 60_000);
  });
});
