import { getAffiliateCodeForCurrentUser } from "@/actions/affiliate";
import InvalidReferralPage from "@/components/global/bad-request/InvalidReferralPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Toaster } from "react-hot-toast";
import CardContentSection from "./components/CardContentSection";

const Affiliate = async () => {
  const userAffiliateCode = await getAffiliateCodeForCurrentUser();
  if (!userAffiliateCode)
    return (
      <InvalidReferralPage message="Can't get your affiliate code at the moment" />
    );
  const userAffiliateLink = `/affiliates/${userAffiliateCode}`;

  console.log(
    userAffiliateCode,
    "<- user affiliate code coming from /dashboard/[workspaceid]/affiliate/page.tsx"
  );
  return (
    <main className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)]">
      <div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
      <div className="min-h-screen flex items-start p-6">
        <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">
              Your Affiliate Link
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create and share your invitation link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardContentSection userAffiliateLink={userAffiliateLink} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Affiliate;
