import { onAuthenticateAdmin } from "@/actions/admin";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const auth = await onAuthenticateAdmin();
  if (auth.isAdmin === false) {
    return <CenteredErrorMessage message="You are not an admin!" />;
  }

  redirect("/admin/dashboard/chat");

  return (
    <div className="container min-w-full h-screen flex justify-center items-center">
      <div className="text-2xl font-bold">Wait until you get redirected...</div>
    </div>
  );
};

export default Page;
