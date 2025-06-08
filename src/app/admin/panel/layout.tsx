import React from "react";
import Navbar from "../components/Navbar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="w-full h-screen">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
