import { getSession } from "@/actions/user";
import client from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET:
 *   - If Admin, return a list of all Chats (with user info & last message preview).
 *   - If normal User, return *only* their own Chat (if it exists).
 * POST:
 *   - Create a new Chat (only for a normal User).
 */

const adminId = process.env.ADMIN_ID!;

export async function GET() {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    try {
      const chats = await client.chat.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              deposit: true,
              withdrawal: true,
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
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json({ chats });
    } catch (error) {
      console.log("Error fetching chats for admin: ", error);
      return NextResponse.json(
        { error: "Error fetching chats" },
        { status: 500 }
      );
    }
  } else {
    try {
      const chat = await client.chat.findUnique({
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
      console.log("Error fetching user chat: ", error);
      return NextResponse.json(
        { error: "Error fetching chat" },
        { status: 500 }
      );
    }
  }
}

export async function POST() {
  console.log("this is 1");
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  console.log("this is 2");
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    return NextResponse.json(
      { error: "Admins can't create new user chats" },
      { status: 403 }
    );
  }
  console.log("this is 3");

  if (!adminId) {
    return NextResponse.json(
      { error: "ADMIN_USER_ID not configured" },
      { status: 500 }
    );
  }

  console.log("this is 4");

  try {
    const existing = await client.chat.findUnique({
      where: { userId_adminId: { userId, adminId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Chat already exists" },
        { status: 400 }
      );
    }

    console.log("this is 5");

    const newChat = await client.chat.create({
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
    console.log("this is 6");
    console.log("this is new chat", newChat);
    return NextResponse.json({ chat: newChat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Error creating chat" }, { status: 500 });
  }
}
