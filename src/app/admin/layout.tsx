import { getSession } from "@/actions/user";
import Navbar from "@/components/admin/Navbar";
import ErrorMessage from "@/components/global/error/ErrorMessage";
import { UserRoundX } from "lucide-react";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const session = await getSession();
  if (!session || session.status !== 200 || !session.user) {
    return (
      <ErrorMessage
        errorHeader="User not authenticated"
        errorBody="You need to signIn again."
        icon={<UserRoundX className="w-14 h-14 text-red-500" />}
      />
    );
  }
  if (session.user.role !== "ADMIN") {
    return (
      <ErrorMessage
        errorHeader="You are not an admin"
        errorBody="Get an admin status to access this page."
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
