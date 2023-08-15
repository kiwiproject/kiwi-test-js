import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { MongoClient } from "mongodb";
import { GenericContainer } from "testcontainers";

async function startMongoContainer() {
  global.MONGO_CONTAINER = await new GenericContainer("mongo")
    .withExposedPorts(27017)
    .start();
}

async function stopMongoContainer() {
  KiwiPreconditions.checkState(
    global.MONGO_CONTAINER !== undefined,
    "Mongo container has not been previously started",
  );
  await global.MONGO_CONTAINER.stop();
  global.MONGO_CONTAINER = undefined;
}

function getMongoBaseUrl(): string {
  KiwiPreconditions.checkState(
    global.MONGO_CONTAINER !== undefined,
    "Mongo container has not been previously started",
  );

  return `mongodb://${global.MONGO_CONTAINER.getHost()}:${global.MONGO_CONTAINER.getMappedPort(27017,)}/`;
}

async function clearDatabase(dbName: string) {
  const client = new MongoClient(getMongoBaseUrl());
  const db = client.db(dbName);

  const collections = await db.collections();
  for (const c of collections) {
    await c.drop();
  }

  await client.close(true);
}

export const MongoExtension = {
  startMongoContainer,
  stopMongoContainer,
  getMongoBaseUrl,
  clearDatabase,
};
