"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateAdmin = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated", isAdmin: false };
    }

    // Check if user exists in the database
    const userExists = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        role: true,
        workspace: true,
      },
    });
    if (userExists) {
      if (userExists.role === "ADMIN") {
        return {
          status: 200,
          message: "Admin found in database",
          user: userExists,
          isAdmin: true,
        };
      } else {
        return {
          status: 200,
          message: "User found in database",
          user: userExists,
          isAdmin: false,
        };
      }
    }

    return {
      status: 404,
      message: "User not found",
      isAdmin: false,
    };
  } catch (error) {
    return {
      status: 500,
      message: error instanceof Error ? error.message : String(error),
      isAdmin: false,
    };
  }
};

export const setEstimatedReplyTime = async (time: number) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated", success: false };
    }

    // Check if user exists in the database
    const userExists = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        role: true,
        workspace: true,
      },
    });

    if (userExists) {
      if (userExists.role === "ADMIN") {
        await client.setting.deleteMany({});
        await client.setting.create({
          data: {
            estimatedReplyTime: time,
          },
        });

        return {
          status: 200,
          message: "Admin found in database",
          success: true,
        };
      } else {
        return {
          status: 401,
          message: "You are not admin",
          success: false,
        };
      }
    }

    return {
      status: 404,
      message: "User not found",
      success: false,
    };
  } catch (error) {
    return {
      status: 500,
      message: error instanceof Error ? error.message : String(error),
      success: false,
    };
  }
};
