"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const addDepositToPlatform = async (
  platformName: string,
  platformId: string,
  amount: number,
  chatId: string
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        status: 404,
        message: "User not authorized",
      };
    }

    const isAdmin = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!isAdmin) {
      return {
        status: 404,
        message: "Couldn't get admin on database",
      };
    }

    if (isAdmin.role === "USER") {
      return {
        status: 401,
        message: "You have to be admin to perform this operation",
      };
    }

    const depositingUser = await client.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        userId: true,
      },
    });
    if (!depositingUser) {
      return {
        status: 404,
        message: "Couldn't find the depositing user on database",
      };
    }

    const platform = await client.platform.findFirst({
      where: {
        userId: depositingUser.userId,
        platformName,
        platformId,
      },
    });
    if (!platform) {
      return { status: 404, message: "Platform not found for this user" };
    }

    const addDepositOnPlatform = await client.platform.update({
      where: {
        id: platform.id,
      },
      data: {
        deposits: { push: amount },
      },
    });
    if (!addDepositOnPlatform) {
      return {
        status: 400,
        message: "Couldn't add deposit for the user, check platform ID",
      };
    }

    const transactionAmount = "+" + amount.toString();
    const addTrasaction = await client.transaction.create({
      data: {
        userId: depositingUser.userId,
        transactionMadeFor: "DEPOSIT",
        transactionAmount: transactionAmount,
      },
    });
    if (!addTrasaction) {
      return {
        status: 400,
        message: "Unable to update transaction for the user",
      };
    }

    return {
      status: 200,
      message: "Amount deposited into user's ID successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

export const addWithdrawToPlatform = async (
  platformName: string,
  platformId: string,
  amount: number,
  chatId: string
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        status: 404,
        message: "User not authorized",
      };
    }

    const isAdmin = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!isAdmin) {
      return {
        status: 404,
        message: "Couldn't get admin on database",
      };
    }

    if (isAdmin.role === "USER") {
      return {
        status: 401,
        message: "You have to be admin to perform this operation",
      };
    }

    const withdrawingUser = await client.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        userId: true,
      },
    });
    if (!withdrawingUser) {
      return {
        status: 404,
        message: "Couldn't find the withdrawing user on database",
      };
    }

    const platform = await client.platform.findFirst({
      where: {
        userId: withdrawingUser.userId,
        platformName,
        platformId,
      },
      select: {
        id: true,
        deposits: true,
        withdrawals: true,
      },
    });
    if (!platform) {
      return { status: 404, message: "Platform not found for this user" };
    }

    let totalDeposits = 0;
    let totalWithdrawls = 0;
    totalDeposits += Number(
      platform.deposits.map((deposit) => {
        return deposit;
      })
    );

    totalWithdrawls += Number(
      platform.withdrawals.map((withdrawl) => {
        return withdrawl;
      })
    );

    if (totalWithdrawls - totalDeposits <= 0) {
      return {
        status: 401,
        message: "The user does not have enough funds.",
      };
    }
    if (totalDeposits - amount < 0) {
      return {
        status: 401,
        message: "The user does not have enough money.",
      };
    }

    const addWithdrawOnPlatform = await client.platform.update({
      where: {
        id: platform.id,
      },
      data: {
        withdrawals: { push: amount },
      },
    });
    if (!addWithdrawOnPlatform) {
      return {
        status: 400,
        message: "Couldn't add withdrawal for the user, check platform ID",
      };
    }

    const transactionAmount = "-" + amount.toString();
    const addTransaction = await client.transaction.create({
      data: {
        userId: withdrawingUser.userId,
        transactionMadeFor: "WITHDRAWL",
        transactionAmount: transactionAmount,
      },
    });
    if (!addTransaction) {
      return {
        status: 400,
        message: "Unable to update transaction for the user",
      };
    }

    return {
      status: 200,
      message: "Amount withdrawn from user's ID successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
