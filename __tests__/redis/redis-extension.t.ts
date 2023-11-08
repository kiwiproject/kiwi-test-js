import { afterEach, describe, expect, it } from "@jest/globals";
import { RedisExtension } from "../../src/redis/redis-extension";
import { createClient } from "redis";

describe("RedisExtension", () => {
  afterEach(async () => {
    if (global.REDIS_CONTAINER) {
      await global.REDIS_CONTAINER.stop();
      global.REDIS_CONTAINER = undefined;
    }

    delete process.env.REDIS_EXTENSION_BASE_URI;
  });

  describe("startRedisContainer", () => {
    it("should start the redis container", async () => {
      await RedisExtension.startRedisContainer();

      expect(global.REDIS_CONTAINER).toBeDefined();

      expect(process.env.REDIS_EXTENSION_BASE_URI).toEqual(
        `redis://${global.REDIS_CONTAINER.getHost()}:${global.REDIS_CONTAINER.getFirstMappedPort()}/`,
      );
    }, 60_000);
  });

  describe("stopRedisContainer", () => {
    it("should stop the redis container", async () => {
      await RedisExtension.startRedisContainer();
      await RedisExtension.stopRedisContainer();

      expect(global.REDIS_CONTAINER).toBeUndefined();
      expect(process.env.REDIS_EXTENSION_BASE_URI).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(RedisExtension.stopRedisContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Redis container has not been previously started or is not running in band",
        ),
      );

      expect(global.REDIS_CONTAINER).toBeUndefined();
    });
  });

  describe("setRedisBaseUrl", () => {
    it("should set the uri env variable for the redis url", () => {
      RedisExtension.setRedisBaseUrl("localhost", 12345);

      expect(process.env.REDIS_EXTENSION_BASE_URI).toEqual(
        "redis://localhost:12345/",
      );
    });
  });

  describe("getRedisBaseUrl", () => {
    it("should return the base url for the started container", async () => {
      await RedisExtension.startRedisContainer();

      const url = RedisExtension.getRedisBaseUrl();
      expect(url).toContain("redis://localhost:");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => RedisExtension.getRedisBaseUrl()).toThrow(
        "IllegalStateException: Redis container has not been previously started",
      );
    });
  });

  describe("flushDatabase", () => {
    it("should flush the given database from redis", async () => {
      await RedisExtension.startRedisContainer();

      const client = createClient({ url: RedisExtension.getRedisBaseUrl() }).on(
        "error",
        (err) => console.log("Redis error", err),
      );

      await client.connect();
      await client.set("foo", "bar");

      const keysBeforeFlush = await client.keys("*");
      expect(keysBeforeFlush).toContain("foo");

      await RedisExtension.flushDatabase();

      const keysAfterFlush = await client.keys("*");
      expect(keysAfterFlush).not.toContain("foo");

      await client.quit();
    }, 60_000);
  });
});
