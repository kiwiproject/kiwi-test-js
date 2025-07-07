import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { ElasticsearchContainer } from "@testcontainers/elasticsearch";
import { Client } from "@elastic/elasticsearch";
import { IngestPutPipelineRequest } from "@elastic/elasticsearch/lib/api/types";

/**
 * Starts an Elastic search container and stores the container information in global.ELASTIC_SEARCH_CONTAINER.
 *
 * @param image The image name/version to use for elastic search. Defaults to elasticsearch:9.0.3.
 */
async function startElasticSearchContainer(
  image: string = "elasticsearch:9.0.3",
) {
  const container = await new ElasticsearchContainer(image)
    .withEnvironment({ "xpack.security.enabled": "false" })
    .start();

  process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI = container.getHttpUrl();

  // NOTE: This will only work if tests are runInBand (i.e. not in parallel)
  global.ELASTIC_SEARCH_CONTAINER = container;
}

/**
 * Stops a previously started Elastic search container. Error will be thrown if startElasticSearchContainer was not
 * previously called.
 */
async function stopElasticSearchContainer() {
  KiwiPreconditions.checkState(
    global.ELASTIC_SEARCH_CONTAINER !== undefined,
    "Elastic Search container has not been previously started or is not running in band",
  );
  await global.ELASTIC_SEARCH_CONTAINER.stop();
  global.ELASTIC_SEARCH_CONTAINER = undefined;
  delete process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI;
}

function setElasticSearchUrl(host: string, port: number) {
  process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI = `http://${host}:${port}`;
}

/**
 * Retrieves the URL for accessing the running Elastic Search container. Error will be thrown if startElasticSearchContainer
 * was not previously called.
 */
function getElasticSearchUrl(): string {
  KiwiPreconditions.checkState(
    process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI !== undefined,
    "Elastic Search container has not been previously started",
  );

  return process.env.ELASTIC_SEARCH_EXTENSION_BASE_URI;
}

async function createIndex(
  indexName: string,
  indexMapping: unknown,
  pipelines: Array<unknown>,
) {
  const client = new Client({ node: getElasticSearchUrl() });
  await client.indices.create({
    index: indexName,
    mappings: indexMapping,
  });

  for (const pipeline of pipelines) {
    await client.ingest.putPipeline(pipeline as IngestPutPipelineRequest);
  }

  await client.close();
}

async function clearIndex(indexName: string) {
  const client = new Client({ node: getElasticSearchUrl() });
  await client.deleteByQuery({
    index: indexName,
    query: {
      match_all: {},
    },
    refresh: true,
  });
  await client.close();
}

async function deleteIndex(indexName: string) {
  const client = new Client({ node: getElasticSearchUrl() });
  await client.indices.delete({
    index: indexName,
  });
  await client.close();
}

export const ElasticSearchExtension = {
  startElasticSearchContainer,
  stopElasticSearchContainer,
  setElasticSearchUrl,
  getElasticSearchUrl,
  createIndex,
  clearIndex,
  deleteIndex,
};
