import { getSession, performDeposit } from "@/actions/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string; amount: number; userId: string } }
) {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  // const adminId = session.user.id;

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "You don't have access to perform deposit",
      },
      { status: 403 }
    );
  }

  const deposit = await performDeposit(params.userId, params.amount);
  if (!deposit || deposit.status !== 200) {
    return NextResponse.json(
      { error: "Unable to deposit amount" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Amount deposited into the user's account successfully" },
    { status: 200 }
  );
}
