import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { ElasticsearchContainer } from "@testcontainers/elasticsearch";

async function startElasticSearchContainer(
  image: string = "elasticsearch:8.6.1",
) {
  global.ELASTIC_SEARCH_CONTAINER = await new ElasticsearchContainer(image)
    .withEnvironment({ "xpack.security.enabled": "false" })
    .start();
}

async function stopElasticSearchContainer() {
  KiwiPreconditions.checkState(
    global.ELASTIC_SEARCH_CONTAINER !== undefined,
    "Elastic Search container has not been previously started",
  );
  await global.ELASTIC_SEARCH_CONTAINER.stop();
  global.ELASTIC_SEARCH_CONTAINER = undefined;
}

function getElasticSearchUrl(): string {
  KiwiPreconditions.checkState(
    global.ELASTIC_SEARCH_CONTAINER !== undefined,
    "Elastic Search container has not been previously started",
  );

  return global.ELASTIC_SEARCH_CONTAINER.getHttpUrl();
}

export const ElasticSearchExtension = {
  startElasticSearchContainer,
  stopElasticSearchContainer,
  getElasticSearchUrl,
};
