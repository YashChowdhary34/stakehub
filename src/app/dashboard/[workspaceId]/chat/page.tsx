import { getEstimatedReplyTime, getSession } from "@/actions/user";
import React from "react";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";
import UserChat from "./UserChat";

const UserChatPage = async () => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return (
      <div className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <CenteredErrorMessage message="User not authenticated" />
      </div>
    );
  }

  const userId = session.user.id;

  const expectedReplyTime = await getEstimatedReplyTime();
  if (
    !expectedReplyTime ||
    expectedReplyTime.status !== 200 ||
    !expectedReplyTime.estimatedReplyTime?.estimatedReplyTime
  ) {
    return (
      <div className="flex-1 h-full overflow-hidden">
        <UserChat userId={userId} eta="1hrs" />
      </div>
    );
  }
  return (
    <div className="flex-1 h-full overflow-hidden">
      <UserChat
        userId={userId}
        eta={`${expectedReplyTime.estimatedReplyTime?.estimatedReplyTime}hrs`}
      />
    </div>
  );
};

export default UserChatPage;
