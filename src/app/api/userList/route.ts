import { getSession } from "@/actions/user";
import client from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    return NextResponse.json({ error: "You are not admin" }, { status: 401 });
  }

  try {
    const users = await client.chat.findMany({
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
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.log("Error fetching chats for admin: ", error);
    return NextResponse.json(
      { error: "Error fetching chats" },
      { status: 500 }
    );
  }
}
