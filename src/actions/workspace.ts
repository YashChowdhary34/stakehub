"use server";

import prisma from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server";

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user)
      return {
        status: 403,
        error: "User not authenticated",
      };

    const userWorkspace = await prisma.workSpace.findUnique({
      where: {
        id: workspaceId,
        //WIP: add checking if user has access to workspace
      },
    });
    if (!userWorkspace) {
      return {
        status: 404,
        error: "User workspace not found",
      };
    }

    return {
      status: 200,
      data: { workspace: userWorkspace },
      error: null,
    };
  } catch (error) {
    return {
      status: 403,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
