import { getSession } from "@/actions/user";
import React from "react";
import Chat from "./page";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";

const Layout = async () => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return (
      <div className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <CenteredErrorMessage message="User not authenticated" />
      </div>
    );
  }

  const userId = session.user.id;
  return (
    <div>
      <Chat userId={userId} eta="1hr" />
    </div>
  );
};

export default Layout;
