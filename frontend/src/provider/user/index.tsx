import React, { createContext, useContext, useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";
export type User = {
  nickname: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  userType: string;
  userID: number;
  JWT: string;
  refresh: string;
};

export enum LoggingState {
  Logged = "Logged",
  NotLogged = "NotLogged",
  NotCheckedYet = "NotCheckedYet",
}

const UserContext = createContext({
  isLoggedIn: LoggingState.NotCheckedYet,
  user: null as User | null,
  logIn: (d: User) => {},
  logOut: () => {},
  update: (d: any) => {},
});

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<LoggingState>(
    LoggingState.NotCheckedYet
  );
  const [userStorage, setUserStorage] = useLocalStorage<any>("user", null);

  const handleLogin = (user: User) => {
    setIsLoggedIn(LoggingState.Logged);
    setUser(user);
    setUserStorage(user);
  };

  useEffect(() => {
    if (userStorage !== null) {
      setIsLoggedIn(LoggingState.Logged);
      const user: User = {
        nickname: userStorage.nickname,
        email: userStorage.email,
        phoneNumber: userStorage.phoneNumber,
        birthDate: userStorage.birthDate,
        userType: userStorage.userType,
        userID: userStorage.userID,
        JWT: userStorage.JWT,
        refresh: userStorage.refresh,
      };
      setUser(user);
    } else {
      setIsLoggedIn(LoggingState.NotLogged);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(LoggingState.NotLogged);
    setUser(null);
    setUserStorage(null);
  };

  const handleUpdate = (user: User) => {
    if (user !== null) {
      setIsLoggedIn(LoggingState.Logged);
      setUser(user);
      setUserStorage(user);
    }
  };

  const data = {
    isLoggedIn: isLoggedIn,
    user: user,
    logIn: handleLogin,
    logOut: handleLogout,
    update: handleUpdate,
  };

  return <UserContext.Provider value={data}>{children}</UserContext.Provider>;
};

const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "`useUserProvider` hook cannot be used outside of a `UserProvider`!"
    );
  }
  return context;
};

export default useUserContext;
