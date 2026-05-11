import * as Crypto from "expo-crypto";
import React, { createContext, useContext, useState } from "react";

const SessionContext = createContext<{ sessionId: string }>({
  sessionId: "",
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Initialize immediately to avoid null on first render
  const [sessionId] = useState(() => Crypto.randomUUID());

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
