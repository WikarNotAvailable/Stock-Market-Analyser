import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router";
import { Home } from "../../pages/Home";
import { Login } from "../../pages/Login";
import { Navbar } from "./navbar/Navbar";
import api from "../../api/api";
import useUserContext from "../../provider/user";
import { Footer } from "./footer/Footer";
import { Register } from "../../pages/Register";
import { Profile } from "../../pages/Profile";

export const RouterWrapper = () => {
  const { user, update } = useUserContext();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        const res = await api.refresh({ refresh: user?.refresh });
        update({ ...user, JWT: res.access });
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Flex flexWrap="wrap" direction="column">
      <BrowserRouter>
        <Flex maxW="100vw" minH="100vh" overflow="hidden" flexDir="column">
          <Navbar />
          <Flex mt="100px" align="center" flexDir="column" flex="1" mb="100px">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Flex>
          <Footer />
        </Flex>
      </BrowserRouter>
    </Flex>
  );
};
