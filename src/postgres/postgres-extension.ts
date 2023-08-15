import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

async function startPostgresContainer() {
  global.POSTGRES_CONTAINER = await new PostgreSqlContainer().start();
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

async function setupNewDatabase(dbName: string) {
  const dbClient = new Client({
    connectionString: getPostgresBaseUrl(),
  });
  await dbClient.connect();
  await dbClient.query(`create database ${dbName}`);
  await dbClient.end();
}

async function clearDatabase(dbName: string) {
  const client = new Client({
    connectionString: getPostgresBaseUrl().replace(/\/test$/, `/${dbName}`),
  });
  await client.connect();

  const response = await client.query(
    "select table_name from information_schema.tables where table_catalog = $1 and table_schema = 'public'",
    [dbName],
  );
  const tables = response.rows.map((row) => row.table_name);

  for (const table of tables) {
    await client.query(`truncate table ${table}`);
  }
  await client.end();
}

export const PostgresExtension = {
  startPostgresContainer,
  stopPostgresContainer,
  getPostgresBaseUrl,
  setupNewDatabase,
  clearDatabase,
};
