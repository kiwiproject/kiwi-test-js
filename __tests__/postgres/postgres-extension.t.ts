import { describe, it, expect, afterEach } from "@jest/globals";
import { PostgresExtension } from "../../src";
import { Client } from "pg";

describe("PostgresExtension", () => {
  afterEach(async () => {
    if (global.POSTGRES_CONTAINER) {
      await global.POSTGRES_CONTAINER.stop();
      global.POSTGRES_CONTAINER = undefined;
    }
  });

  describe("startPostgresContainer", () => {
    it("should start the postgres container", async () => {
      await PostgresExtension.startPostgresContainer();

      expect(global.POSTGRES_CONTAINER).toBeDefined();

      await global.POSTGRES_CONTAINER.stop();
    }, 60_000);
  });

  describe("stopPostgresContainer", () => {
    it("should stop the postgres container", async () => {
      await PostgresExtension.startPostgresContainer();
      await PostgresExtension.stopPostgresContainer();

      expect(global.POSTGRES_CONTAINER).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(PostgresExtension.stopPostgresContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Postgres container has not been previously started",
        ),
      );

      expect(global.POSTGRES_CONTAINER).toBeUndefined();
    });
  });

  describe("getPostgresBaseUrl", () => {
    it("should return the base url for the started container", async () => {
      await PostgresExtension.startPostgresContainer();

      const url = PostgresExtension.getPostgresBaseUrl();
      expect(url).toContain("postgres://test:test@localhost:");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => PostgresExtension.getPostgresBaseUrl()).toThrow(
        "IllegalStateException: Postgres container has not been previously started",
      );
    });
  });

  describe("clearDatabase", () => {
    it("should truncate all tables in the database", async () => {
      await PostgresExtension.startPostgresContainer();
      const url = PostgresExtension.getPostgresBaseUrl();

      const dbclient = new Client({
        connectionString: url,
      });
      await dbclient.connect();
      await dbclient.query("create database kiwi");
      await dbclient.end();

      const tableClient = new Client({
        connectionString: url.replace(/\/test$/, "/kiwi"),
      });
      await tableClient.connect();
      await tableClient.query("create table my_test_table (name varchar)");
      await tableClient.query(
        "insert into my_test_table (name) values ('foo')",
      );
      const responseBefore = await tableClient.query(
        "select count(*) from my_test_table",
      );
      expect(responseBefore.rows[0].count).toEqual("1");
      await tableClient.end();

      await PostgresExtension.clearDatabase("kiwi");

      const tableClient2 = new Client({
        connectionString: url.replace(/\/test$/, "/kiwi"),
      });
      await tableClient2.connect();
      const responseAfter = await tableClient2.query(
        "select count(*) from my_test_table",
      );
      expect(responseAfter.rows[0].count).toEqual("0");
      await tableClient2.end();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(PostgresExtension.clearDatabase("kiwi")).rejects.toEqual(
        Error(
          "IllegalStateException: Postgres container has not been previously started",
        ),
      );

      expect(global.POSTGRES_CONTAINER).toBeUndefined();
    });
  });

  describe("setupNewDatabase", () => {
    it("should create a database with the given name", async () => {
      await PostgresExtension.startPostgresContainer();
      await PostgresExtension.setupNewDatabase("kiwi_test");

      const client = new Client({
        connectionString: global.POSTGRES_CONTAINER.getConnectionUri(),
      });
      await client.connect();
      const response = await client.query("select datname from pg_database");

      const names = response.rows.map((row) => row.datname);
      expect(names).toContain("kiwi_test");
      await client.end();
    });
  });
});
