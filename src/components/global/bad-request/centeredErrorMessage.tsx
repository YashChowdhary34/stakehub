import React from "react";

type Props = {
  message: string;
};

const CenteredErrorMessage = ({ message }: Props) => {
  return (
    <div className="container min-w-full h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center items-center">
        {" "}
        <h2 className="font-bold tracking-wide text-2xl">
          An Exception Has Occured
        </h2>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default CenteredErrorMessage;
