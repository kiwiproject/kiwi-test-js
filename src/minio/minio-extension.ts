import { KiwiPreconditions } from "@kiwiproject/kiwi-js";
import { GenericContainer, Wait } from "testcontainers";

async function startMinioSearchContainer(accessKey: string, secretKey: string) {
  global.MINIO_CONTAINER = await new GenericContainer(
    "quay.io/minio/minio:latest",
  )
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

async function stopMinioSearchContainer() {
  KiwiPreconditions.checkState(
    global.MINIO_CONTAINER !== undefined,
    "Minio container has not been previously started",
  );
  await global.MINIO_CONTAINER.stop();
  global.MINIO_CONTAINER = undefined;
}

function getMinioPort(): number {
  KiwiPreconditions.checkState(
    global.MINIO_CONTAINER !== undefined,
    "Minio container has not been previously started",
  );

  return global.MINIO_CONTAINER.getMappedPort(9000);
}

export const MinioExtension = {
  startMinioSearchContainer,
  stopMinioSearchContainer,
  getMinioPort,
};
