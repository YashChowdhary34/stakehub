"use client";
import React from "react";

type Props = {
  params: { workspaceId: string };
};

const Page = ({ params: { workspaceId } }: Props) => {
  return (
    <main className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-white text-black">
      Dashboard Page
      <br />
      Workspace ID - {`${workspaceId}`}
    </main>
  );
};

export default Page;
