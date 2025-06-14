import React from "react";
import UserTransactions from "./transactions/UserTransactions";
import { getSession } from "@/actions/user";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";

const TransactionsPage = async () => {
  const userSession = await getSession();
  if (!userSession) {
    return <CenteredErrorMessage message="Try again later" />;
  }

  const profit = userSession.user?.profit || 0;
  return (
    <div className="h-full w-full overflow-x-hidden">
      <div className="h-16 md:hidden" />
      <UserTransactions totalProfit={profit} />
    </div>
  );
};

export default TransactionsPage;
