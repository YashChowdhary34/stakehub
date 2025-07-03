"use server";

import prisma from "@/lib/prismaClient";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated" };
    }

    const userExists = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        workspace: true,
      },
    });
    if (userExists) {
      return {
        status: 200,
        message: "User found in database",
        user: userExists,
      };
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.imageUrl,
        workspace: {
          create: {},
        },
      },
      include: {
        workspace: true,
      },
    });

    return { status: 201, message: "User created successfully", user: newUser };
  } catch (error) {
    return {
      status: 500,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
