import { onAuthenticateUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const auth = await onAuthenticateUser();

  // Redirect after authentication
  if (auth.status === 200 || auth.status === 201) {
    return redirect(`/dashboard/${auth.user?.workspace?.id}/chat`);
  }
  if (auth.status === 400 || auth.status === 500 || auth.status === 404) {
    return redirect("/auth/sign-in");
  }
}
