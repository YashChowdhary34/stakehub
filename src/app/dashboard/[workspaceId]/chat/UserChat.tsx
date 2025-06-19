import React, { useState } from "react";

type Props = {
  userId: string;
};

const UserChat = ({ userId }: Props) => {
  return <div>UserChat - {userId}</div>;
};

export default UserChat;
