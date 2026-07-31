import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Client } from "pg";

/**
 * Options for tuning the Postgres container started by {@link startPostgresContainer}.
 *
 * Both options trade durability for speed. That is safe here because a test container's
 * data does not outlive the test run, but it means neither should be used against a
 * container whose contents you expect to survive a crash.
 */
export interface StartPostgresContainerOptions {
  /**
   * Starts Postgres with fsync, synchronous_commit and full_page_writes turned off.
   *
   * Test suites that reset state between tests spend most of their database time in
   * commit and DDL fsyncs rather than in the queries themselves. Turning durability off
   * removes those flushes. The gain is largest on slow or IOPS-limited disks, which is
   * typically CI.
   *
   * Defaults to false.
   */
  disableDurability?: boolean;

  /**
   * Places the Postgres data directory on a tmpfs mount so writes never reach the host disk.
   *
   * Size the mount for the whole run, not for one database. A suite that creates a database
   * per test file pays roughly 8 MB per database before any of its own data, so a few hundred
   * files will exhaust the default. Postgres reports the overflow as
   * `No space left on device`, which surfaces as widespread and confusing query failures.
   *
   * Defaults to false.
   */
  tmpfsDataDir?: boolean;

  /**
   * Size of the tmpfs mount, as a mount(8) size value. Ignored unless tmpfsDataDir is true.
   *
   * This is host memory, so it competes with everything else on the machine. Raising it on a
   * CI runner that executes several jobs concurrently can push the box into swap.
   *
   * Defaults to "1g".
   */
  tmpfsSize?: string;
}

// The official postgres image defaults PGDATA to /var/lib/postgresql/data. initdb refuses to
// run in a directory with group or world access, and a tmpfs mount is created world-writable,
// so PGDATA is pointed at a subdirectory instead. The entrypoint creates that subdirectory
// with the permissions and ownership initdb wants.
const TMPFS_MOUNT_PATH = "/var/lib/postgresql/data";
const TMPFS_PGDATA_PATH = `${TMPFS_MOUNT_PATH}/pgdata`;

/**
 * Starts a Postgres container and stores the container information in global.POSTGRES_CONTAINER.
 *
 * @param image The image name/version to use for postgres. Defaults to postgres:15.
 * @param options Optional performance tuning. See {@link StartPostgresContainerOptions}.
 */
async function startPostgresContainer(
  image: string = "postgres:15",
  options: StartPostgresContainerOptions = {},
) {
  let containerDef = new PostgreSqlContainer(image);

  if (options.tmpfsDataDir) {
    const size = options.tmpfsSize ?? "1g";
    containerDef = containerDef
      .withTmpFs({ [TMPFS_MOUNT_PATH]: `rw,noexec,nosuid,size=${size}` })
      .withEnvironment({ PGDATA: TMPFS_PGDATA_PATH });
  }

  if (options.disableDurability) {
    containerDef = containerDef.withCommand([
      "postgres",
      "-c",
      "fsync=off",
      "-c",
      "synchronous_commit=off",
      "-c",
      "full_page_writes=off",
    ]);
  }

  const container = await containerDef.start();
  process.env.POSTGRES_EXTENSION_BASE_URI = container.getConnectionUri();

  // NOTE: This will only work if tests are runInBand (i.e. not in parallel)
  global.POSTGRES_CONTAINER = container;
}

/**
 * Stops a previously started Postgres container. Error will be thrown if startPostgresContainer is not
 * previously called.
 */
async function stopPostgresContainer() {
  KiwiPreconditions.checkState(
    global.POSTGRES_CONTAINER !== undefined,
    "Postgres container has not been previously started or is not running in band",
  );
  await global.POSTGRES_CONTAINER!.stop();
  global.POSTGRES_CONTAINER = undefined;
  delete process.env.POSTGRES_EXTENSION_BASE_URI;
}

function setPostgresBaseUrl(
  host: string,
  port: number,
  user: string = "test",
  password: string = "test",
  dbName: string = "test",
) {
  process.env.POSTGRES_EXTENSION_BASE_URI = `postgres://${user}:${password}@${host}:${port}/${dbName}`;
}

/**
 * Retrieves the base URL for accessing the running Postgres container. Error will be thrown if
 * startPostgresContainer is not previously called.
 */
function getPostgresBaseUrl(): string {
  KiwiPreconditions.checkState(
    process.env.POSTGRES_EXTENSION_BASE_URI !== undefined,
    "Postgres container has not been previously started",
  );

  return process.env.POSTGRES_EXTENSION_BASE_URI!;
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

async function dropDatabase(dbName: string) {
  const dbClient = new Client({
    connectionString: getPostgresBaseUrl(),
  });

  await dbClient.connect();
  await dbClient.query(
    `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${dbName}'`,
  );
  await dbClient.query(`drop database ${dbName}`);
  await dbClient.end();
}

export const PostgresExtension = {
  startPostgresContainer,
  stopPostgresContainer,
  setPostgresBaseUrl,
  getPostgresBaseUrl,
  getPostgresUriWithDb,
  setupNewDatabase,
  dropDatabase,
};
