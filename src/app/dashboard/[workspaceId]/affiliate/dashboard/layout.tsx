import { getReferralsCount } from "@/actions/affiliate";
import InvalidReferralPage from "@/components/global/bad-request/InvalidReferralPage";
import React from "react";
import AffiliateDashboard from "./page";

const Layout = async () => {
  const referralsCount = await getReferralsCount();
  if (referralsCount.status !== 200) {
    <InvalidReferralPage
      message={referralsCount.message ? referralsCount.message : ""}
    />;
  }
  console.log(referralsCount.referralsMadeCount);
  return (
    <AffiliateDashboard referralsCount={referralsCount.referralsMadeCount} />
  );
};

export default Layout;
