import { getSession } from "@/actions/user";
import prisma from "@/lib/prismaClient";
import { NextRequest, NextResponse } from "next/server";

async function validateRequest(chatId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return { error: "Not authenticated", status: 401 };
  }

  if (!chatId) {
    return { error: "Chat ID not found", status: 400 };
  }

  const chat = await prisma.chat.findUnique({
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
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await context.params;
  const sessionValidation = await validateRequest(chatId);
  if ("error" in sessionValidation) {
    return NextResponse.json(
      { error: sessionValidation.error },
      { status: sessionValidation.status }
    );
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const before = url.searchParams.get("before"); //ISO timestamp string
  const after = url.searchParams.get("after"); //ISO timestamp string
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  try {
    // Base where clause: restrict to this chat
    const baseWhere = { chatId: sessionValidation.chat.id };

    // Case 1: forward sync: fetch newer messages after a timestamp
    if (after) {
      const afterDate = new Date(after);
      const newMessages = await prisma.message.findMany({
        where: {
          ...baseWhere,
          createdAt: { gt: afterDate },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          senderId: true,
          type: true,
          content: true,
          fileUrl: true,
          fileName: true,
          filePath: true,
          fileType: true,
          createdAt: true,
          readAt: true,
        },
      });
      return NextResponse.json({ newMessages }, { status: 200 });
    }

    // Case 2: backward pagination: fetch older messages before a timestamp
    if (before) {
      const beforeDate = new Date(before);
      // Fetch the page in descending order to get closest items before 'beforeDate'
      const msgsDesc = await prisma.message.findMany({
        where: {
          ...baseWhere,
          createdAt: { lt: beforeDate },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          senderId: true,
          type: true,
          content: true,
          fileUrl: true,
          fileName: true,
          filePath: true,
          fileType: true,
          createdAt: true,
          readAt: true,
        },
      });
      // Reverse to ascending order for client display
      const messages = msgsDesc.reverse();
      return NextResponse.json({ messages }, { status: 200 });
    }

    // Case 3: initial/latest load (no before/after): fetch latest page
    // Fetch in descending order and reverse
    const latestDesc = await prisma.message.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        senderId: true,
        type: true,
        content: true,
        fileUrl: true,
        fileName: true,
        filePath: true,
        fileType: true,
        createdAt: true,
        readAt: true,
      },
    });
    const messages = latestDesc.reverse();
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.log("Error fetching paginated messages: ", error);
    return NextResponse.json(
      { error: "Error fetching messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await context.params;
  const sessionValidation = await validateRequest(chatId);
  if ("error" in sessionValidation) {
    return NextResponse.json(
      { error: sessionValidation.error },
      { status: sessionValidation.status }
    );
  }

  try {
    const body = await request.json();
    const { type, content, fileUrl, fileName, filePath, fileType } = body as {
      type: "TEXT" | "FILE";
      content?: string;
      fileUrl?: string;
      fileName?: string;
      filePath?: string;
      fileType?: string;
    };
    if (
      !type ||
      (type === "TEXT" && !content) ||
      (type === "FILE" && (!fileUrl || !fileName || !fileType))
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const newMessage = await prisma.message.create({
      data: {
        chat: { connect: { id: sessionValidation.chat.id } },
        sender: { connect: { id: sessionValidation.session.user.id } },
        type,
        content: type === "TEXT" ? content! : null,
        fileUrl: type === "FILE" ? fileUrl : null,
        fileName: type === "FILE" ? fileName : null,
        filePath: type === "FILE" ? filePath : null,
        fileType: type === "FILE" ? fileType : null,
      },
      select: {
        id: true,
        senderId: true,
        type: true,
        content: true,
        fileUrl: true,
        fileName: true,
        filePath: true,
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
