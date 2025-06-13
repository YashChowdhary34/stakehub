import React from "react";
import UserTransactions from "./UserTransactions";
import { getSession } from "@/actions/user";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";

const TransactionsPage = async () => {
  const userSession = await getSession();
  if (!userSession) {
    return <CenteredErrorMessage message="Try again later" />;
  }

  const profit = userSession.user?.profit || 0;
  return (
    <main className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
      <UserTransactions totalProfit={profit} />
    </main>
  );
};

export default TransactionsPage;
