import { addReferral } from "@/actions/affiliate";
import { onAuthenticateUser } from "@/actions/user";
import { redirect } from "next/navigation";

type searchParams = {
  affiliateCode?: string;
  referrerId?: string;
};

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: searchParams;
}) {
  const auth = await onAuthenticateUser();

  console.log(searchParams);

  if (searchParams.affiliateCode && searchParams.referrerId) {
    const newReferral = await addReferral(
      searchParams.affiliateCode,
      searchParams.referrerId
    );
    console.log(
      "New Referral added! \n affiliateCode:",
      searchParams.affiliateCode,
      "referrerId:",
      searchParams.referrerId,
      "status:",
      newReferral.status
    );
    console.log(newReferral.status);
  }

  console.log("callback page is running");
  console.log("User ID:", auth.user?.id);

  // Redirect after authentication
  if (auth.status === 200 || auth.status === 201) {
    if (auth.user?.workspace && auth.user.workspace.id) {
      redirect(`/dashboard/${auth.user.workspace.id}`);
    } else {
      redirect("/auth/sign-in");
    }
  } else {
    redirect("/auth/sign-in");
  }
}
