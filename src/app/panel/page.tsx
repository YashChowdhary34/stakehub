import { onAuthenticateUser } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function PanelPage() {
  const auth = await onAuthenticateUser();

  // Redirect after authentication
  if (auth.status === 200 || auth.status === 201) {
    return redirect(`/panel/${auth.user?.workspace?.id}`);
  }
  if (auth.status === 400 || auth.status === 500 || auth.status === 404) {
    return redirect("/auth/sign-in");
  }
}
