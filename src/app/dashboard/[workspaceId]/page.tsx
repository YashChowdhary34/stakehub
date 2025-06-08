"use client";
import React from "react";

type Props = {
  params: { workspaceId: string };
};

const Page = ({ params: { workspaceId } }: Props) => {
  return (
    <main className="fixed top-0 w-full mt-16 h-screen md:mt-0 md:ml-64 flex-grow bg-white text-black">
      Dashboard Page
    </main>
  );
};

export default Page;
