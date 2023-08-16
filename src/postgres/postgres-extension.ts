import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

/**
 * Starts a Postgres container and stores the container information in global.POSTGRES_CONTAINER.
 *
 * @param image The image name/version to use for postgres. Defaults to postgres:15.
 */
async function startPostgresContainer(image: string = "postgres:15") {
  global.POSTGRES_CONTAINER = await new PostgreSqlContainer(image).start();
}

/**
 * Stops a previously started Postgres container. Error will be thrown if startPostgresContainer is not
 * previously called.
 */
async function stopPostgresContainer() {
  KiwiPreconditions.checkState(
    global.POSTGRES_CONTAINER !== undefined,
    "Postgres container has not been previously started",
  );
  await global.POSTGRES_CONTAINER.stop();
  global.POSTGRES_CONTAINER = undefined;
}

/**
 * Retrieves the base URL for accessing the running Postgres container. Error will be thrown if
 * startPostgresContainer is not previously called.
 */
function getPostgresBaseUrl(): string {
  KiwiPreconditions.checkState(
    global.POSTGRES_CONTAINER !== undefined,
    "Postgres container has not been previously started",
  );

  return global.POSTGRES_CONTAINER.getConnectionUri();
}

/**
 * Retrieves the base URL plus a given database for accessing the running Postgres container. Error will be thrown if
 * startPostgresContainer is not previously called.
 *
 * @param dbName The name of the database to add to the connection string.
 */
function getPostgresUriWithDb(dbName: string): string {
  return getPostgresBaseUrl().replace(/\/test$/, `/${dbName}`);
}

/**
 * Creates a new database with the given name in the running Postgres. Error will be thrown if
 * startPostgresContainer is not previously called.
 *
 * @param dbName The name of the database to create.
 */
async function setupNewDatabase(dbName: string) {
  const dbClient = new Client({
    connectionString: getPostgresBaseUrl(),
  });
  await dbClient.connect();
  await dbClient.query(`create database ${dbName}`);
  await dbClient.end();
}

export const PostgresExtension = {
  startPostgresContainer,
  stopPostgresContainer,
  getPostgresBaseUrl,
  getPostgresUriWithDb,
  setupNewDatabase,
};
