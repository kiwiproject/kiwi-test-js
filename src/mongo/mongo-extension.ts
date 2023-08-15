import {KiwiPreconditions} from "@kiwiproject/kiwi-js";
import {GenericContainer} from "testcontainers";

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

  const host = global.MONGO_CONTAINER.getHost();
  const port = global.MONGO_CONTAINER.getMappedPort(27017);
  return `mongodb://${host}:${port}/`;
}

function getMongoUriWithDb(dbName: string): string {
  return `${getMongoBaseUrl()}/${dbName}`;
}

export const MongoExtension = {
  startMongoContainer,
  stopMongoContainer,
  getMongoBaseUrl,
  getMongoUriWithDb,
};
