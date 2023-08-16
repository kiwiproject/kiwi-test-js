import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

async function startPostgresContainer(image: string = "postgres:15") {
  global.POSTGRES_CONTAINER = await new PostgreSqlContainer(image).start();
}

async function stopPostgresContainer() {
  KiwiPreconditions.checkState(
    global.POSTGRES_CONTAINER !== undefined,
    "Postgres container has not been previously started",
  );
  await global.POSTGRES_CONTAINER.stop();
  global.POSTGRES_CONTAINER = undefined;
}

function getPostgresBaseUrl(): string {
  KiwiPreconditions.checkState(
    global.POSTGRES_CONTAINER !== undefined,
    "Postgres container has not been previously started",
  );

  return global.POSTGRES_CONTAINER.getConnectionUri();
}

function getPostgresUriWithDb(dbName: string): string {
  return getPostgresBaseUrl().replace(/\/test$/, `/${dbName}`);
}

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
