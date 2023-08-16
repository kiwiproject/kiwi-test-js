import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { ElasticsearchContainer } from "@testcontainers/elasticsearch";

/**
 * Starts an Elastic search container and stores the container information in global.ELASTIC_SEARCH_CONTAINER.
 *
 * @param image The image name/version to use for elastic search. Defaults to elasticsearch:8.6.1.
 */
async function startElasticSearchContainer(
  image: string = "elasticsearch:8.6.1",
) {
  global.ELASTIC_SEARCH_CONTAINER = await new ElasticsearchContainer(image)
    .withEnvironment({ "xpack.security.enabled": "false" })
    .start();
}

/**
 * Stops a previously started Elastic search container. Error will be thrown if startElasticSearchContainer was not
 * previously called.
 */
async function stopElasticSearchContainer() {
  KiwiPreconditions.checkState(
    global.ELASTIC_SEARCH_CONTAINER !== undefined,
    "Elastic Search container has not been previously started",
  );
  await global.ELASTIC_SEARCH_CONTAINER.stop();
  global.ELASTIC_SEARCH_CONTAINER = undefined;
}

/**
 * Retrieves the URL for accessing the running Elastic Search container. Error will be thrown if startElasticSearchContainer
 * was not previously called.
 */
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
