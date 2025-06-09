import { getSession } from "@/actions/user";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";
import React from "react";
import AdminChat from "./AdminChat";

const Layout = async () => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return <CenteredErrorMessage message="User not authenticated" />;
  }
  if (session.user.role !== "ADMIN") {
    return <CenteredErrorMessage message="You don't have admin access" />;
  }

  const adminId = session.user.id;

  return (
    <div className="container min-w-full h-screen flex justify-center items-center">
      <AdminChat adminId={adminId} />
    </div>
  );
};

export default Layout;
