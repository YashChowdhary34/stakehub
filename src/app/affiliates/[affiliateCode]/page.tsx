import { verifyAffiliateCode } from "@/actions/affiliate";
import InvalidReferralPage from "@/components/global/bad-request/InvalidReferralPage";
import React from "react";
import SignUpWithReferral from "../SignUpWithReferral";

type Props = {
  params: { affiliateCode: string };
};

const AffiliateEntryPage = async ({ params: { affiliateCode } }: Props) => {
  const validAffiliateCode = await verifyAffiliateCode(affiliateCode);
  if (validAffiliateCode.status !== 200 || !validAffiliateCode.referrer) {
    return <InvalidReferralPage message={validAffiliateCode.message} />;
  }

  console.log(
    "this is from /affiliates/[affiliateCode]/page:",
    affiliateCode,
    "referrer: ",
    validAffiliateCode.referrer.id
  );

  return (
    <SignUpWithReferral
      affiliateCode={affiliateCode}
      referrerId={validAffiliateCode.referrer.id}
    />
  );
};

export default AffiliateEntryPage;
