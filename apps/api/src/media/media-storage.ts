import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type StoredObject = {
  provider: "local" | "s3";
  path: string;
  url: string;
};

export interface MediaStorage {
  put(key: string, body: Buffer, contentType: string): Promise<StoredObject>;
  read(path: string): Promise<Buffer>;
}

class LocalMediaStorage implements MediaStorage {
  constructor(
    private readonly root: string,
    private readonly publicPrefix = "/v1/media",
  ) {}

  async put(key: string, body: Buffer): Promise<StoredObject> {
    const path = join(this.root, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return { provider: "local", path, url: `${this.publicPrefix}/${key.replace(/\.webp$/, "")}` };
  }

  read(path: string) {
    return readFile(path);
  }
}

class S3MediaStorage implements MediaStorage {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
    endpoint: string,
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
  ) {
    this.client = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<StoredObject> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return {
      provider: "s3",
      path: key,
      url: `${this.publicBaseUrl.replace(/\/$/, "")}/${key}`,
    };
  }

  async read(path: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: path }));
    if (!result.Body) throw new Error("Media obyekti topilmadi");
    const bytes = await result.Body.transformToByteArray();
    return Buffer.from(bytes);
  }
}

export function createMediaStorage(): MediaStorage {
  const driver = process.env.MEDIA_STORAGE_DRIVER ?? "local";
  if (driver === "s3" || driver === "r2") {
    const required = [
      "MEDIA_S3_ENDPOINT",
      "MEDIA_S3_BUCKET",
      "MEDIA_S3_ACCESS_KEY_ID",
      "MEDIA_S3_SECRET_ACCESS_KEY",
      "MEDIA_PUBLIC_BASE_URL",
    ] as const;
    for (const name of required) {
      if (!process.env[name]) throw new Error(`${name} media storage uchun majburiy`);
    }
    return new S3MediaStorage(
      process.env.MEDIA_S3_BUCKET!,
      process.env.MEDIA_PUBLIC_BASE_URL!,
      process.env.MEDIA_S3_ENDPOINT!,
      process.env.MEDIA_S3_ACCESS_KEY_ID!,
      process.env.MEDIA_S3_SECRET_ACCESS_KEY!,
      process.env.MEDIA_S3_REGION ?? "auto",
    );
  }
  return new LocalMediaStorage(process.env.MEDIA_STORAGE_PATH ?? join(process.cwd(), "storage", "media"));
}
