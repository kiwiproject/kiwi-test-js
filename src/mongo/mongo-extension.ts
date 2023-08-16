import {KiwiPreconditions} from "@kiwiproject/kiwi-js";
import {GenericContainer} from "testcontainers";

/**
 * Starts a Mongo container and stores the container information in global.MONGO_CONTAINER.
 *
 * @param image The image name/version to use for mongo. Defaults to mongo:6.
 */
async function startMongoContainer(image: string = "mongo:6") {
  global.MONGO_CONTAINER = await new GenericContainer(image)
    .withExposedPorts(27017)
    .start();
}

/**
 * Stops a previously started Mongo container. Error will be thrown if startMongoContainer is not
 * previously called.
 */
async function stopMongoContainer() {
  KiwiPreconditions.checkState(
    global.MONGO_CONTAINER !== undefined,
    "Mongo container has not been previously started",
  );
  await global.MONGO_CONTAINER.stop();
  global.MONGO_CONTAINER = undefined;
}

/**
 * Retrieves the base connection URL for accessing the running Mongo. Error will be thrown if startMongoContainer
 * is not previously called.
 */
function getMongoBaseUrl(): string {
  KiwiPreconditions.checkState(
    global.MONGO_CONTAINER !== undefined,
    "Mongo container has not been previously started",
  );

  const host = global.MONGO_CONTAINER.getHost();
  const port = global.MONGO_CONTAINER.getMappedPort(27017);
  return `mongodb://${host}:${port}/`;
}

/**
 * Retrieves the base connection URL plus the given db name for accessing the running Mongo. Error will be thrown if
 * startMongoContainer is not previously called.
 * @param dbName The name of the database in mongo to connect.
 */
function getMongoUriWithDb(dbName: string): string {
  return `${getMongoBaseUrl()}${dbName}`;
}

export const MongoExtension = {
  startMongoContainer,
  stopMongoContainer,
  getMongoBaseUrl,
  getMongoUriWithDb,
};
