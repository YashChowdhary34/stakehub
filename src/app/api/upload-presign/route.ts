import { getSession } from "@/actions/user";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid JSON body - ${error}` },
        { status: 400 }
      );
    }

    const { fileName, fileType, chatId, userId } = body as {
      fileName?: string;
      fileType?: string;
      chatId?: string;
      userId?: string;
    };
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing fileName or fileType" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeFolder = chatId ?? "unknown";
    const path = `${safeFolder}/${timestamp}_${userId}_${fileName}`;

    const { data: uploadUrlData, error: uploadUrlError } =
      await supabaseAdmin.storage
        .from("chat-attachments")
        .createSignedUploadUrl(path, { upsert: true });

    if (uploadUrlError || !uploadUrlData) {
      console.error("Error creating signed upload URL:", uploadUrlError);
      return NextResponse.json(
        {
          error: "Failed to create upload URL",
          details: uploadUrlError?.message || uploadUrlError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        uploadUrl: uploadUrlData.signedUrl,
        path,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fatal error in upload-presign:", error);
    return NextResponse.json(
      {
        error: "Fatal error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
