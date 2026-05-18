import type { ElasticsearchContainer } from "@testcontainers/elasticsearch";
import type { GenericContainer } from "testcontainers";
import type { PostgreSqlContainer } from "@testcontainers/postgresql";

declare global {
  var ELASTIC_SEARCH_CONTAINER: ElasticsearchContainer | undefined;
  var MINIO_CONTAINER: GenericContainer | undefined;
  var MONGO_CONTAINER: GenericContainer | undefined;
  var POSTGRES_CONTAINER: PostgreSqlContainer | undefined;
  var REDIS_CONTAINER: GenericContainer | undefined;
}

export {};
