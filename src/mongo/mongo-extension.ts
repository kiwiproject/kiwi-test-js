import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { GenericContainer } from "testcontainers";
import { MongoClient } from "mongodb";

/**
 * Starts a Mongo container and stores the container information in global.MONGO_CONTAINER.
 *
 * @param image The image name/version to use for mongo. Defaults to mongo:6.
 */
async function startMongoContainer(image: string = "mongo:6") {
  const container = await new GenericContainer(image)
    .withExposedPorts(27017)
    .start();

  setMongoBaseUrl(container.getHost(), container.getMappedPort(27017));

  // NOTE: This will only work if tests are runInBand (i.e. not in parallel)
  global.MONGO_CONTAINER = container;
}

/**
 * Stops a previously started Mongo container. Error will be thrown if startMongoContainer is not
 * previously called.
 */
async function stopMongoContainer() {
  KiwiPreconditions.checkState(
    global.MONGO_CONTAINER !== undefined,
    "Mongo container has not been previously started or is not running in band",
  );
  await global.MONGO_CONTAINER.stop();
  global.MONGO_CONTAINER = undefined;
  delete process.env.MONGO_EXTENSION_BASE_URI;
}

function setMongoBaseUrl(host: string, port: number) {
  process.env.MONGO_EXTENSION_BASE_URI = `mongodb://${host}:${port}/`;
}

/**
 * Retrieves the base connection URL for accessing the running Mongo. Error will be thrown if startMongoContainer
 * is not previously called.
 */
function getMongoBaseUrl(): string {
  KiwiPreconditions.checkState(
    process.env.MONGO_EXTENSION_BASE_URI !== undefined,
    "Mongo container has not been previously started",
  );

  return process.env.MONGO_EXTENSION_BASE_URI;
}

/**
 * Retrieves the base connection URL plus the given db name for accessing the running Mongo. Error will be thrown if
 * startMongoContainer is not previously called.
 * @param dbName The name of the database in mongo to connect.
 */
function getMongoUriWithDb(dbName: string): string {
  return `${getMongoBaseUrl()}${dbName}`;
}

async function dropDatabase(dbName: string) {
  const client = new MongoClient(getMongoBaseUrl());
  await client.connect();

  const db = client.db(dbName);
  await db.dropDatabase();

  await client.close(true);
}

export const MongoExtension = {
  startMongoContainer,
  stopMongoContainer,
  setMongoBaseUrl,
  getMongoBaseUrl,
  getMongoUriWithDb,
  dropDatabase,
};
