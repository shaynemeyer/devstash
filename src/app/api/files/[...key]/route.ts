import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const objectKey = key.join("/");

  // Users can only download their own files
  if (!objectKey.startsWith(session.user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey });
    const r2Response = await r2.send(command);

    if (!r2Response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stream = r2Response.Body.transformToWebStream();
    return new Response(stream, {
      headers: {
        "Content-Type": r2Response.ContentType ?? "application/octet-stream",
        "Content-Disposition": r2Response.ContentDisposition ?? "attachment",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
