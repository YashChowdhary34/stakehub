"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getAffiliateCodeForCurrentUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  const isUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { affiliateCode: true },
  });

  return isUser?.affiliateCode ?? null;
};
