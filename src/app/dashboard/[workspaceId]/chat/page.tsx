import { getSession } from "@/actions/user";
import React from "react";
import UserChat from "./UserChat";
import ErrorMessage from "@/components/global/error/ErrorMessage";

const UserChatPage = async () => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return (
      <div className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <ErrorMessage errorHead="User not authenticated" />
      </div>
    );
  }

  const userId = session.user.id;

  return (
    <div className="flex-1 h-full overflow-hidden">
      <UserChat userId={userId} />
    </div>
  );
};

export default UserChatPage;
