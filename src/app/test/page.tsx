import Image from "next/image";
import Link from "next/link";
import React from "react";
import PlaceholderImage from "@/assets/temp/invalidReferralCodeImage.png";

type Props = {
  message: string;
};

const InvalidReferralPage = ({ message }: Props) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{message}</h1>

      <p className="text-sm md:text-base mb-8">
        We apologize for any inconvenience this may have caused.
        <br />
        {message === "Affiliate Code is invalid"
          ? "Please verify the affiliate link."
          : ""}
      </p>

      <div className="relative w-full aspect-square max-w-[300px] mb-8">
        <div className="w-full h-full relative">
          <Image
            src={PlaceholderImage}
            alt="Not Found Image"
            width={300}
            height={300}
            className="w-full h-full"
            priority
          />
        </div>
      </div>

      <p className="">
        You can try{" "}
        <Link
          href="https://spotlight.com"
          className="text-lime-500 hover:text-lime-600 font-medium"
        >
          spotlight.com
        </Link>{" "}
        again, or{" "}
        <Link
          href="/contact"
          className="text-lime-500 hover:text-lime-600 font-medium"
        >
          contact us
        </Link>{" "}
        about a problem.
      </p>
    </div>
  );
};

export default InvalidReferralPage;
