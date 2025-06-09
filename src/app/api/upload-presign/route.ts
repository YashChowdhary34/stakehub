import { getSession } from "@/actions/user";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate env var
const {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  CF_ACCOUNT_ID,
} = process.env;

if (
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !CF_ACCOUNT_ID
) {
  throw new Error(
    "Missing one of the R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, CF_ACCOUNT_ID "
  );
}

// Instantiate s3client pointed to r2 endpoint
// R2’s S3 endpoint pattern is: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  // Ensure only logged-in user can generate presign url
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Expect a json body: {fileName: string, fileType: string}
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: `Invalid JSON body - ${error}` },
      { status: 400 }
    );
  }

  const { fileName, fileType } = body as {
    fileName?: string;
    fileType?: string;
  };

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "Missing fileName or fileType." },
      { status: 400 }
    );
  }

  // Construct a unique key - object name in r2
  const userId = session.user.id;
  const timestamp = Date.now();
  const extension = fileName.split(".").pop();
  const key = `uploads/${userId}/${timestamp}.${extension}`;

  try {
    // Generate a presigned url valid for 5 mins
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // ACL: "public-read", // file can be read publicly
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 300, // seconds
    });

    // For r2 public url patter is  https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET>/<OBJECT_KEY>
    const publicUrl = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;

    return NextResponse.json({
      uploadUrl: presignedUrl,
      publicUrl,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
