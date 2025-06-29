import { getSession } from "@/actions/user";
import React from "react";
import UserChat from "./UserChat";
import ErrorMessage from "@/components/global/error/ErrorMessage";
import { ShieldUser, UserRoundX } from "lucide-react";

const UserChatPage = async () => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return (
      <ErrorMessage
        errorHeader="User not authenticated"
        errorBody="SignIn to stakehub or create a new account."
        icon={<UserRoundX className="w-14 h-14 text-red-500" />}
      />
    );
  }

  if (session.user.role === "ADMIN") {
    return (
      <ErrorMessage
        errorHeader="You are an admin"
        errorBody="Please visit /admin/chat to view the chat interface"
        icon={<ShieldUser className="w-14 h-14 text-red-500" />}
      />
    );
  }

  return <UserChat session={session} userId={session.user.id} />;
};

export default UserChatPage;
