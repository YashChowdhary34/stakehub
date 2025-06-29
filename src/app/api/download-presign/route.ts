import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { path } = await req.json();
  if (!path) {
    return NextResponse.json({ error: "Missing path" });
  }

  // Generate signed URL valid for - 30 days
  const { data: signedUrlData, error: signedUrlError } =
    await supabaseAdmin.storage
      .from("chat-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 30);

  if (signedUrlError || !signedUrlData) {
    console.error("Error generating signed URL:", signedUrlError);
    return NextResponse.json(
      {
        error: "Failed to generate URL",
        details: signedUrlError?.message || signedUrlError,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { downloadUrl: signedUrlData.signedUrl },
    { status: 200 }
  );
}
