import { SignUp } from "@clerk/nextjs";
import React from "react";

type Props = {
  affiliateCode: string;
  referrerId?: string;
};

const SignUpWithReferral = ({ affiliateCode, referrerId }: Props) => {
  return (
    <SignUp
      routing="hash"
      forceRedirectUrl={`/auth/callback?affiliateCode=${affiliateCode}&referrerId=${referrerId}`}
    />
  );
};

export default SignUpWithReferral;
