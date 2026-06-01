import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { r2, R2_BUCKET } from "@/lib/r2";

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const FILE_MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mimeType = file.type;
  const isImage = IMAGE_TYPES.has(mimeType);
  const isFile = FILE_TYPES.has(mimeType);

  if (!isImage && !isFile) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxBytes = isImage ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return NextResponse.json({ error: `File exceeds ${maxMb} MB limit` }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${session.user.id}/${randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ContentDisposition: `attachment; filename="${safeName}"`,
      })
    );
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ key, fileName: file.name, fileSize: file.size, mimeType });
}
