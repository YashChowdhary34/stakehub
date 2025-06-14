import { getSession } from "@/actions/user";
import client from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function validateRequest(chatId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return { error: "Not authenticated", status: 401 };
  }

  if (!chatId) {
    return { error: "Chat ID not found", status: 400 };
  }

  const chat = await client.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      userId: true,
      adminId: true,
    },
  });

  if (!chat) {
    return { error: "Chat not found", status: 404 };
  }

  // Only the client and admin can access this
  if (session.user.id !== chat.userId && session.user.id !== chat.adminId) {
    return { error: "Forbidden: Not part of this chat", status: 403 };
  }

  return { session, chat };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const validation = await validateRequest(params.chatId);
  if ("error" in validation) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  try {
    const messages = await client.message.findMany({
      where: { chatId: validation.chat.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        type: true,
        content: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        readAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.log("Error fetching messages: ", error);
    return NextResponse.json(
      { error: "Error fetching messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const validation = await validateRequest(params.chatId);
  if ("error" in validation) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  try {
    const body = await request.json();
    const { type, content, fileUrl, fileName, fileType } = body as {
      type: "TEXT" | "FILE";
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
    };
    if (
      !type ||
      (type === "TEXT" && !content) ||
      (type === "FILE" && (!fileUrl || !fileName || !fileType))
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const newMessage = await client.message.create({
      data: {
        chat: { connect: { id: validation.chat.id } },
        sender: { connect: { id: validation.session.user.id } },
        type,
        content: type === "TEXT" ? content! : null,
        fileUrl: type === "FILE" ? fileUrl : null,
        fileName: type === "FILE" ? fileName : null,
        fileType: type === "FILE" ? fileType : null,
      },
      select: {
        id: true,
        senderId: true,
        type: true,
        content: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        createdAt: true,
        readAt: true,
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Error creating message" },
      { status: 500 }
    );
  }
}
