"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const verifyAffiliateCode = async (affiliateCode: string) => {
  try {
    const referrer = await client.user.findUnique({
      where: {
        affiliateCode: affiliateCode,
      },
      select: {
        id: true,
      },
    });
    if (!referrer)
      return {
        status: 404,
        message: "Affiliate Code is invalid",
        referrer: null,
      };

    return {
      status: 200,
      message: "Affiliate code is valid",
      referrer: referrer,
    };
  } catch (error) {
    return {
      status: 500,
      error: error,
      message: "Check the affiliate code and try again",
      referrer: null,
    };
  }
};

// Should be called after signup
export const addReferral = async (
  affiliateCode: string,
  referrerId: string
) => {
  try {
    console.log("addReferral called with:", affiliateCode, referrerId);
    const user = await currentUser();
    console.log("currentUser in addReferral:", user);
    if (!user) {
      return { status: 401, message: "User not authenticated" };
    }

    const isUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });
    if (!isUser) return { status: 404, message: "User not found in database" };

    console.log("isUser in addReferral:", isUser);

    // Prevent self-referral
    if (isUser.id === referrerId) {
      return { status: 400, message: "You cannot refer yourself." };
    }

    const existingReferral = await client.referral.findUnique({
      where: { referredId: isUser.id },
    });
    if (existingReferral) {
      return { status: 409, message: "User has already been referred" };
    }

    const newReferral = await client.referral.create({
      data: {
        code: affiliateCode,
        referredId: isUser.id,
        referrerId: referrerId,
      },
    });

    return {
      status: 200,
      message: "Referral registered",
      referral: newReferral,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return { status: 409, message: "User has already been referred" };
    }

    return {
      status: 500,
      error: error,
      message: "Exception occured try again",
    };
  }
};

export const getAffiliateCodeForCurrentUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  const isUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { affiliateCode: true },
  });

  return isUser?.affiliateCode ?? null;
};

export const getReferralsCount = async () => {
  try {
    const user = await currentUser();
    if (!user)
      return {
        status: 401,
        message: "User not authenticated",
        referralsMadeCount: 0,
      };

    const data = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        _count: {
          select: { referralsMade: true },
        },
      },
    });

    if (!data) {
      return { status: 404, message: "User not found", referralsMadeCount: 0 };
    }

    return {
      status: 200,
      referralsMadeCount: data._count.referralsMade,
    };
  } catch (error) {
    return {
      status: 500,
      error: error,
      message: "Error occured while fetching referrals",
      referralsMadeCount: 0,
    };
  }
};
