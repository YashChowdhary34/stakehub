"use server";

import client from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated", user: null };
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
    return { status: 500, message: error, user: null };
  }
};

export const getSession = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 404, message: "User not authenticated", user: null };
    }
    const userSession = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!userSession) {
      return { status: 403, message: "Couldn't get userSession", user: null };
    }
    return {
      status: 200,
      message: "Successfully got userSession",
      user: userSession,
    };
  } catch (error) {
    return {
      status: 500,
      message: error,
      user: null,
    };
  }
};

export const getEstimatedReplyTime = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        status: 404,
        message: "User not authenticated",
        estimatedReplyTime: null,
      };
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
      const replyTime = await client.setting.findFirst({
        select: {
          estimatedReplyTime: true,
        },
      });
      return {
        status: 200,
        message: "Successfully fetched estimated reply time",
        estimatedReplyTime: replyTime,
      };
    }

    return {
      status: 401,
      message: "User doesn't exist on the database",
      estimatedReplyTime: null,
    };
  } catch (error) {
    return {
      status: 500,
      message: error,
      getEstimatedReplyTime: null,
    };
  }
};

export const createUserGamingId = async (
  chatId: string,
  platformName: string,
  platformId: string,
  platformPassword: string
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        status: 404,
        message: "User not authenticated",
      };
    }

    const userStatus = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        role: true,
      },
    });
    if (!userStatus || userStatus.role === "USER") {
      return {
        status: 401,
        message: "Only admins can create gaming ID",
      };
    }

    const findUser = await client.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        userId: true,
      },
    });
    if (!findUser) {
      return {
        status: 404,
        message: "No user found in the chatId",
      };
    }

    const getPlatforms = await client.user.findUnique({
      where: {
        id: findUser.userId,
      },
      select: {
        id: true,
        platforms: true,
      },
    });
    if (!getPlatforms) {
      return {
        status: 404,
        message: "Couldn't find user with the chat userId",
      };
    }

    if (
      getPlatforms.platforms.find(
        (platform) => platform.platformId === platformId
      )
    ) {
      return {
        status: 401,
        message: "PlatformId already present",
      };
    }

    const createPlatform = await client.platform.create({
      data: {
        userId: getPlatforms.id,
        platformName: platformName,
        platformId: platformId,
        platformPassword: platformPassword,
        deposits: [],
        withdrawals: [],
      },
    });
    if (!createPlatform) {
      return { status: 400, message: "Unable to create platform for user" };
    }

    return {
      status: 200,
      message: "Platform created successfully",
      platform: true,
    };
  } catch (error) {
    return {
      status: 500,
      error: error,
    };
  }
};

export const getPlatform = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        status: 404,
        message: "User not authenticated",
      };
    }

    const getUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        platforms: true,
      },
    });
    if (!getUser) {
      return {
        status: 404,
        message: "User not found in database",
      };
    }

    const userPlatforms = await client.platform.findMany({
      where: {
        userId: getUser.id,
      },
    });
    if (!userPlatforms) {
      return {
        status: 400,
        message: "Unable to get user platforms",
      };
    }

    return {
      status: 200,
      message: "Successfully fetched platforms",
      platforms: userPlatforms,
    };
  } catch (error) {
    return {
      status: 500,
      error: error,
    };
  }
};

// Call only after verifying admin status
// export const performDeposit = async (userId: string, amount: number) => {
//   try {
//     const user = await currentUser();
//     if (!user) {
//       return {
//         status: 404,
//         message: "User not authenticated",
//       };
//     }

//     const depositUser = await client.user.update({
//       where: {
//         id: userId,
//       },
//       data: {
//         deposits: { push: amount },
//       },
//     });
//     if (!depositUser) {
//       return {
//         status: 400,
//         message: "Unable to push deposit",
//       };
//     }

//     return {
//       status: 200,
//       message: "Deposited Successfully",
//     };
//   } catch (error) {
//     return {
//       status: 500,
//       message: error,
//     };
//   }
// };
