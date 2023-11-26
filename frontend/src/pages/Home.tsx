import { useEffect } from "react";
import useUserContext, { User } from "../provider/user";
import { useNavigate } from "react-router-dom";
import { LoggingState } from "../provider/user";

export const Home = () => {
  const { user, isLoggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === LoggingState.NotLogged) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  return <>Hello World!</>;
};
