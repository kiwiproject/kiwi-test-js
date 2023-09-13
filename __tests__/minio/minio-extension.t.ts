import { afterEach, describe, expect, it } from "@jest/globals";
import { MinioExtension } from "../../src";

describe("MinioExtension", () => {
  afterEach(async () => {
    if (global.MINIO_CONTAINER) {
      await global.MINIO_CONTAINER.stop();
      global.MINIO_CONTAINER = undefined;
    }

    delete process.env.MINIO_EXTENSION_PORT;
    delete process.env.MINIO_EXTENSION_HOST;
  });

  describe("startMinioContainer", () => {
    it("should start the minio container", async () => {
      await MinioExtension.startMinioContainer();

      expect(global.MINIO_CONTAINER).toBeDefined();
      expect(process.env.MINIO_EXTENSION_PORT).toBeDefined();
      expect(process.env.MINIO_EXTENSION_HOST).toBeDefined();
    }, 60_000);
  });

  describe("stopMinioContainer", () => {
    it("should stop the minio container", async () => {
      await MinioExtension.startMinioContainer();
      await MinioExtension.stopMinioContainer();

      expect(global.MINIO_CONTAINER).toBeUndefined();
      expect(process.env.MINIO_EXTENSION_PORT).toBeUndefined();
      expect(process.env.MINIO_EXTENSION_HOST).toBeUndefined();
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(MinioExtension.stopMinioContainer()).rejects.toEqual(
        Error(
          "IllegalStateException: Minio container has not been previously started or is not running in band",
        ),
      );

      expect(global.MINIO_CONTAINER).toBeUndefined();
    });
  });

  describe("setMinioPort", () => {
    it("should set the port env variable for the minio port", () => {
      MinioExtension.setMinioPort(12345);

      expect(process.env.MINIO_EXTENSION_PORT).toEqual("12345");
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

  describe("setMinioHost", () => {
    it("should set the host env variable for the minio host", () => {
      MinioExtension.setMinioHost("min.io");

      expect(process.env.MINIO_EXTENSION_HOST).toEqual("min.io");
    });
  });

  describe("getMinioHost", () => {
    it("should return the host for the started container", async () => {
      await MinioExtension.startMinioContainer();

      const host = MinioExtension.getMinioHost();
      expect(host).toEqual("localhost");
    }, 60_000);

    it("should throw error when container is not previously started", () => {
      expect(() => MinioExtension.getMinioHost()).toThrow(
        "IllegalStateException: Minio container has not been previously started",
      );
    });
  });
});
