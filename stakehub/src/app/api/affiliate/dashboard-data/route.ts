import { getSession } from "@/actions/user";
import client from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    try {
      const userData = await client.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          firstName: true,
          lastName: true,
          affiliateCode: true,
          referralsMade: {
            select: {
              referred: {
                select: {
                  id: true,
                  profit: true,
                  transactions: {
                    select: {
                      transactionAmount: true,
                      transactionMadeFor: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!userData) {
        return NextResponse.json(
          { error: "Coundn't get user data" },
          { status: 404 }
        );
      }
      let combinedDeposit = 0;
      let combinedWithdrawal = 0;

      const referredUsers = userData.referralsMade.map((ref) => ref.referred);

      const combinedProfit = referredUsers?.reduce(
        (sum, user) => sum + (user?.profit || 0),
        0
      );

      if (referredUsers.length > 0) {
        for (const user of referredUsers) {
          for (const txn of user?.transactions ?? []) {
            if (txn.transactionMadeFor === "DEPOSIT") {
              combinedDeposit += Number(txn.transactionAmount) || 0;
            } else if (txn.transactionMadeFor === "WITHDRAWL") {
              combinedWithdrawal += Number(txn.transactionAmount) || 0;
            }
          }
        }
      }

      return NextResponse.json({
        userData,
        cntReferredUsers: referredUsers.length,
        referredUsers,
        combinedProfit,
        combinedDeposit,
        combinedWithdrawal,
      });
    } catch (error) {
      return NextResponse.json({
        error: error,
      });
    }
  } else {
    console.log("You are an admin - no affiliate dashboard data");
  }
}
