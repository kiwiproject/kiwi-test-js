import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { GenericContainer, Wait } from "testcontainers";

/**
 * Starts a Minio container and stores the container information in global.MINIO_CONTAINER
 *
 * @param accessKey The access key configured to connect. Defaults to minioadmin.
 * @param secretKey The secret key configured to connect. Defaults to keyboard cat.
 * @param image The image name/version to use for minio. Defaults to minio/minio:RELEASE.2023-08-09T23-30-22Z.
 */
async function startMinioContainer(
  accessKey: string = "minioadmin",
  secretKey: string = "keyboard cat",
  image: string = "minio/minio:RELEASE.2023-08-09T23-30-22Z",
) {
  global.MINIO_CONTAINER = await new GenericContainer(image)
    .withEnvironment({
      MINIO_BROWSER: "off",
      MINIO_ROOT_USER: accessKey,
      MINIO_ROOT_PASSWORD: secretKey,
    })
    .withExposedPorts(9000)
    .withWaitStrategy(
      Wait.forAll([Wait.forListeningPorts(), Wait.forLogMessage(/1 Online/)]),
    )
    .withTmpFs({ "/data": "rw,noexec,nosuid" })
    .withCommand(["server", "/data"])
    .start();
}

/**
 * Stops a previously started Minio container. Error will be thrown if startMinioContainer has not been
 * previously called.
 */
async function stopMinioContainer() {
  KiwiPreconditions.checkState(
    global.MINIO_CONTAINER !== undefined,
    "Minio container has not been previously started",
  );
  await global.MINIO_CONTAINER.stop();
  global.MINIO_CONTAINER = undefined;
}

/**
 * Retrieves the mapped external port of the started Minio container. Error will be thrown if startMinioContainer was
 * not previously called.
 */
function getMinioPort(): number {
  KiwiPreconditions.checkState(
    global.MINIO_CONTAINER !== undefined,
    "Minio container has not been previously started",
  );

  return global.MINIO_CONTAINER.getMappedPort(9000);
}

export const MinioExtension = {
  startMinioContainer,
  stopMinioContainer,
  getMinioPort,
};
