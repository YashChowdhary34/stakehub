import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";
import React from "react";
import UserTransactionList from "../../components/UserTransactionList";
import { getSession } from "@/actions/user";

const page = async () => {
  const userSession = await getSession();
  if (!userSession) {
    return <CenteredErrorMessage message="Try again later" />;
  }

  const profit = userSession.user?.profit || 0;

  return (
    <main>
      <UserTransactionList clientProfit={profit} />
    </main>
  );
};

export default page;
