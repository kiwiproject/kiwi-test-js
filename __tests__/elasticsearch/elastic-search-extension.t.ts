import {afterEach, describe, expect, it} from "@jest/globals";
import {ElasticSearchExtension} from "../../src";

describe("ElasticSearchExtension", () => {
  afterEach(async () => {
    if (global.ELASTIC_SEARCH_CONTAINER) {
      await global.ELASTIC_SEARCH_CONTAINER.stop();
      global.ELASTIC_SEARCH_CONTAINER = undefined;
    }
  });

  describe("startElasticSearchContainer", () => {
    it("should start the elastic search container", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeDefined();

      await global.ELASTIC_SEARCH_CONTAINER.stop();
    }, 60_000);
  });

  describe("stopElasticSearchContainer", () => {
    it("should stop the elastic search container", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();
      await ElasticSearchExtension.stopElasticSearchContainer();

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(
        ElasticSearchExtension.stopElasticSearchContainer(),
      ).rejects.toEqual(
        Error(
          "IllegalStateException: Elastic Search container has not been previously started",
        ),
      );

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeUndefined();
    });
  });

  describe("getElasticSearchUrl", () => {
    it("should return the base url for the started container", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      const url = ElasticSearchExtension.getElasticSearchUrl();
      expect(url).toContain("http://localhost:");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => ElasticSearchExtension.getElasticSearchUrl()).toThrow(
        "IllegalStateException: Elastic Search container has not been previously started",
      );
    });
  });
});
