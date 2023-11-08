import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { GenericContainer } from "testcontainers";
import { createClient } from "redis";

/**
 * Starts a Redis container and stores the container information in global.REDIS_CONTAINER.
 *
 * @param image The image name/version to use for redis. Defaults to redis:7.
 */
async function startRedisContainer(image: string = "redis:7") {
  const container = await new GenericContainer(image)
    .withExposedPorts(6379)
    .start();

  setRedisBaseUrl(container.getHost(), container.getMappedPort(6379));

  // NOTE: This will only work if tests are runInBand (i.e. not in parallel)
  global.REDIS_CONTAINER = container;
}

/**
 * Stops a previously started Redis container. Error will be thrown if startRedisContainer is not
 * previously called.
 */
async function stopRedisContainer() {
  KiwiPreconditions.checkState(
    global.REDIS_CONTAINER !== undefined,
    "Redis container has not been previously started or is not running in band",
  );
  await global.REDIS_CONTAINER.stop();
  global.REDIS_CONTAINER = undefined;
  delete process.env.REDIS_EXTENSION_BASE_URI;
}

function setRedisBaseUrl(host: string, port: number) {
  process.env.REDIS_EXTENSION_BASE_URI = `redis://${host}:${port}/`;
}

/**
 * Retrieves the base connection URL for accessing the running Redis. Error will be thrown if startRedisContainer
 * is not previously called.
 */
function getRedisBaseUrl(): string {
  KiwiPreconditions.checkState(
    process.env.REDIS_EXTENSION_BASE_URI !== undefined,
    "Redis container has not been previously started",
  );

  return process.env.REDIS_EXTENSION_BASE_URI;
}

async function flushDatabase() {
  const client = createClient({ url: getRedisBaseUrl() }).on("error", (err) =>
    console.log("Redis error", err),
  );

  await client.connect();
  await client.flushDb();
  await client.quit();
}

export const RedisExtension = {
  startRedisContainer,
  stopRedisContainer,
  setRedisBaseUrl,
  getRedisBaseUrl,
  flushDatabase,
};
