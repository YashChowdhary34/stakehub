import Loader from "@/components/global/loader";
import React from "react";

const AuthLoading = () => {
  return (
    <div className="flex h-screen w-full justify-center items-center">
      <Loader state={true} />
    </div>
  );
};

export default AuthLoading;
