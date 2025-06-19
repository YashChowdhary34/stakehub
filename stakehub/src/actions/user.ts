"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated" };
    }

    // Check if user exists in the database
    const userExists = await client.user.findUnique({
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

    // If user does not exist, create a new user
    const newUser = await client.user.create({
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

export const getAffiliateCode = async () => {
  const user = await currentUser();
  if (!user) return null;

  const isUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { affiliateCode: true },
  });

  return isUser?.affiliateCode ?? null;
};
