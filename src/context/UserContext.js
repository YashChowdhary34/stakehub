import { getSession } from "@/actions/user";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({
  userId: null,
  role: "USER",
  setUserId: () => {},
  setUserRole: () => {},
});

export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("USER");

  useEffect(() => {
    async function loadUser() {
      const session = await getSession();
      if (
        session &&
        session.status === 200 &&
        session.user?.id &&
        session.user.role
      ) {
        setUserId(session.user.id);
        setRole(session.user.role);
      }
    }
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ userId, role }}>
      {children}
    </UserContext.Provider>
  );
}
