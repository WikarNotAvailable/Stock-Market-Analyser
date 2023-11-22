import { useEffect } from "react";
import useUserContext, { User } from "../provider/user";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { user, isLoggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  return <>Hello World!</>;
};
