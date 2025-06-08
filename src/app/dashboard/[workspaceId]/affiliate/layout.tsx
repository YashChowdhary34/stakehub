import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  return <div>{children}</div>;
};

export default Layout;
