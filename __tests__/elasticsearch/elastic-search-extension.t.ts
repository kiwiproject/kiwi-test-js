import { afterEach, describe, expect, it } from "@jest/globals";
import { ElasticSearchExtension } from "../../src";
import { Client } from "@elastic/elasticsearch";

describe("ElasticSearchExtension", () => {
  afterEach(async () => {
    if (global.ELASTIC_SEARCH_CONTAINER) {
      await global.ELASTIC_SEARCH_CONTAINER.stop();
      global.ELASTIC_SEARCH_CONTAINER = undefined;
    }

    delete process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI;
  });

  describe("startElasticSearchContainer", () => {
    it("should start the elastic search container", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeDefined();
      expect(process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI).toEqual(
        global.ELASTIC_SEARCH_CONTAINER.getHttpUrl(),
      );
    }, 60_000);
  });

  describe("stopElasticSearchContainer", () => {
    it("should stop the elastic search container", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();
      await ElasticSearchExtension.stopElasticSearchContainer();

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeUndefined();
      expect(process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(
        ElasticSearchExtension.stopElasticSearchContainer(),
      ).rejects.toEqual(
        Error(
          "IllegalStateException: Elastic Search container has not been previously started or is not running in band",
        ),
      );

      expect(global.ELASTIC_SEARCH_CONTAINER).toBeUndefined();
    });
  });

  describe("setElasticSearchUrl", () => {
    it("should set the uri env variable for the elastic search url", () => {
      ElasticSearchExtension.setElasticSearchUrl("localhost", 12345);

      expect(process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI).toEqual(
        "http://localhost:12345",
      );
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

  describe("createIndex", () => {
    it("should successfully create the requested index", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      const mappings = {
        properties: {
          eventType: {
            type: "keyword",
            index: true,
          },
        },
      };

      const pipeline = {
        id: "kiwi-attachment-pipeline",
        body: {
          processors: [
            {
              attachment: {
                field: "pdfVersionRaw",
                target_field: "pdfVersion",
                remove_binary: true,
              },
            },
          ],
        },
      };

      await ElasticSearchExtension.createIndex("kiwi", mappings, [pipeline]);

      const client = new Client({
        node: ElasticSearchExtension.getElasticSearchUrl(),
      });

      const indices = await client.cat.indices({ format: "json" });
      const indexNames = indices.map((i) => i.index);
      expect(indexNames).toContain("kiwi");

      await client.close();
    }, 60_000);
  });

  describe("clearIndex", () => {
    it("should clear all data in the given index", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      const client = new Client({
        node: ElasticSearchExtension.getElasticSearchUrl(),
      });

      await client.indices.create({
        index: "kiwi_clear",
        mappings: {
          properties: {
            eventType: {
              type: "keyword",
              index: true,
            },
          },
        },
      });

      await client.index({
        index: "kiwi_clear",
        document: {
          eventType: "foo",
        },
        id: "12345",
        refresh: true,
      });

      const countBeforeDelete = await client.count({
        index: "kiwi_clear",
      });

      expect(countBeforeDelete.count).toEqual(1);

      await ElasticSearchExtension.clearIndex("kiwi_clear");

      const countAfterDelete = await client.count({
        index: "kiwi_clear",
      });

      expect(countAfterDelete.count).toEqual(0);
    }, 60_000);
  });

  describe("deleteIndex", () => {
    it("should delete a given index", async () => {
      await ElasticSearchExtension.startElasticSearchContainer();

      const client = new Client({
        node: ElasticSearchExtension.getElasticSearchUrl(),
      });

      await client.indices.create({
        index: "kiwi_delete",
        mappings: {
          properties: {
            eventType: {
              type: "keyword",
              index: true,
            },
          },
        },
      });

      const indicesBeforeDelete = await client.cat.indices({ format: "json" });
      const indexNamesBeforeDelete = indicesBeforeDelete.map((i) => i.index);
      expect(indexNamesBeforeDelete).toContain("kiwi_delete");

      await ElasticSearchExtension.deleteIndex("kiwi_delete");

      const indicesAfterDelete = await client.cat.indices({ format: "json" });
      const indexNamesAfterDelete = indicesAfterDelete.map((i) => i.index);
      expect(indexNamesAfterDelete).not.toContain("kiwi_delete");
    }, 60_000);
  });
});
