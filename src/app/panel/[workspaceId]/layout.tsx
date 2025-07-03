import { onAuthenticateUser } from "@/actions/user";
import { verifyAccessToWorkspace } from "@/actions/workspace";
import ErrorPage from "@/components/global/error/ErrorPage";
import Sidebar from "@/components/global/layout/Sidebar";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
};

const DashboardLayout = async ({ params, children }: Props) => {
  const auth = await onAuthenticateUser();
  if (!auth.user?.workspace) redirect("auth/sign-in");

  const { workspaceId } = await params;

  const hasAccess = await verifyAccessToWorkspace(workspaceId);
  if (hasAccess.status !== 200) {
    <ErrorPage errorHead="You don't have access to this workspace" />;
  }

  if (!hasAccess.data?.workspace) return redirect("/auth/sign-in");

  // WIP: react-query to fetch workspace data

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar workspaceId={workspaceId} />
      <main className="flex-1 h-screen overflow-hidden flex flex-col min-w-0">
        {/* Mobile top padding */}
        <div className="h-16 md:h-0" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div>{children}</div>
        </div>
      </main>

      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden opacity-0 pointer-events-none transition-opacity duration-300" />
    </div>
  );
};

export default DashboardLayout;
