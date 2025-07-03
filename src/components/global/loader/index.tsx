import React from "react";
import Spinner from "./spinner";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  state: boolean;
  className?: string;
  color?: string;
  children?: React.ReactNode;
};

const Loader = ({ state, className, children }: Props) => {
  return state ? (
    <div className={cn(className)}>
      <Spinner
        size={50}
        logo={<Image src="/logo.png" alt="logo" width={35} height={35} />}
      />
    </div>
  ) : (
    children
  );
};

export default Loader;
