import type { StartedElasticsearchContainer } from "@testcontainers/elasticsearch";
import type { StartedTestContainer } from "testcontainers";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

declare global {
  var ELASTIC_SEARCH_CONTAINER: StartedElasticsearchContainer | undefined;
  var MINIO_CONTAINER: StartedTestContainer | undefined;
  var MONGO_CONTAINER: StartedTestContainer | undefined;
  var POSTGRES_CONTAINER: StartedPostgreSqlContainer | undefined;
  var REDIS_CONTAINER: StartedTestContainer | undefined;
}

export {};
