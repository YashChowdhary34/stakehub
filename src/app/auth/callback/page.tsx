import { onAuthenticateUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const auth = await onAuthenticateUser();

  // Redirect after authentication
  if (auth.status === 200 || auth.status === 201) {
    if (auth.user?.workspace && auth.user.workspace.id) {
      redirect(`/panel/${auth.user.workspace.id}/chat`);
    } else {
      redirect("/auth/sign-in");
    }
  } else {
    redirect("/auth/sign-in");
  }
}
