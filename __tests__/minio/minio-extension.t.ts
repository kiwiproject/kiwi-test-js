import { afterEach, describe, expect, it } from "@jest/globals";
import { MinioExtension } from "../../src";

describe("MinioExtension", () => {
  afterEach(async () => {
    if (global.MINIO_CONTAINER) {
      await global.MINIO_CONTAINER.stop();
      global.MINIO_CONTAINER = undefined;
    }
  });

  describe("startMinioContainer", () => {
    it("should start the minio container", async () => {
      await MinioExtension.startMinioContainer();

      expect(global.MINIO_CONTAINER).toBeDefined();

      await global.MINIO_CONTAINER.stop();
    }, 60_000);
  });

  describe("stopMinioContainer", () => {
    it("should stop the minio container", async () => {
      await MinioExtension.startMinioContainer();
      await MinioExtension.stopMinioContainer();

      expect(global.MINIO_CONTAINER).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(MinioExtension.stopMinioContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Minio container has not been previously started",
        ),
      );

      expect(global.MINIO_CONTAINER).toBeUndefined();
    });
  });

  describe("getMinioPort", () => {
    it("should return the mapped port for the started container", async () => {
      await MinioExtension.startMinioContainer();

      const port = MinioExtension.getMinioPort();
      expect(port).toBeGreaterThan(0);
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => MinioExtension.getMinioPort()).toThrow(
        "IllegalStateException: Minio container has not been previously started",
      );
    });
  });
});
