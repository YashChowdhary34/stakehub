import { getSession } from "@/actions/user";
import prisma from "@/lib/prismaClient";
import { NextResponse } from "next/server";

/**
 * GET:
 *   - If Admin, return a list of all Chats (with user info & last message preview).
 *   - If normal User, return *only* their own Chat (if it exists).
 * POST:
 *   - Create a new Chat (only for a normal User).
 */

const adminId = process.env.ADMIN_ID || "";

export async function GET() {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              platforms: true,
              transactions: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              type: true,
              content: true,
              fileUrl: true,
              fileType: true,
              fileName: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json({ chats }, { status: 200 });
    } catch (error) {
      console.log("Error fetching chats for admin: ", error);
      return NextResponse.json(
        { error: "Error fetching chats" },
        { status: 500 }
      );
    }
  } else {
    try {
      const chat = await prisma.chat.findUnique({
        where: {
          userId_adminId: { userId, adminId },
        },
        select: { id: true },
      });

      if (!chat) {
        return NextResponse.json(
          { error: "No chat found. Create one via POST." },
          { status: 404 }
        );
      }

      return NextResponse.json({ chat });
    } catch (error) {
      console.error("Error fetching user chat: ", error);
      return NextResponse.json(
        { error: "Error fetching chat" },
        { status: 500 }
      );
    }
  }
}

export async function POST() {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    return NextResponse.json(
      { error: "Admins can't create new user chats" },
      { status: 403 }
    );
  }

  if (!adminId) {
    return NextResponse.json(
      { error: "ADMIN_USER_ID not configured" },
      { status: 500 }
    );
  }

  try {
    const existing = await prisma.chat.findUnique({
      where: { userId_adminId: { userId, adminId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Chat already exists" },
        { status: 400 }
      );
    }

    const newChat = await prisma.chat.create({
      data: {
        user: { connect: { id: userId } },
        admin: { connect: { id: adminId } },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json({ chat: newChat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Error creating chat" }, { status: 500 });
  }
}
