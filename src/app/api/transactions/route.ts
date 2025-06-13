import { getSession } from "@/actions/user";
import client from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userSession = await getSession();
    if (!userSession || userSession.status !== 200) {
      return NextResponse.json(
        { error: "Couldn't find user" },
        { status: 404 }
      );
    }
    const userId = userSession.user?.id || "";
    const url = new URL(req.url || "");
    const take = parseInt(url.searchParams.get("take") || "10", 10);
    const cursor = url.searchParams.get("cursor");

    let transactions;
    if (cursor) {
      // Fetch next page after the cursor
      transactions = await client.transaction.findMany({
        where: { userId },
        orderBy: { transactionMadeOn: "desc" },
        cursor: { id: cursor },
        skip: 1, // skip the cursor itself
        take: take,
      });
    } else {
      // First page (no cursor)
      transactions = await client.transaction.findMany({
        where: { userId },
        orderBy: { transactionMadeOn: "desc" },
        take: take,
      });
    }

    let nextCursor: string | null = null;
    if (transactions.length === take) {
      // More items may exist: set cursor to last item's id
      nextCursor = transactions[transactions.length - 1].id;
    }
    // If fewer than `take`, nextCursor stays null: indicates no more pages.

    return NextResponse.json({ nextCursor, transactions }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
