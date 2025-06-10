import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  console.log("is this running 44444");
  return (
    <div className="container min-w-full h-screen flex justify-center items-center">
      {children}
    </div>
  );
};
export default Layout;
