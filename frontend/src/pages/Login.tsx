import { Button, Flex, Text, useToast, Link } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useUserContext, { User } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Input } from "../components/shared/Input";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isLoggedIn, logIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  const onChangeEmail = (e: any) => {
    setEmail(e.target.value);
    var validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (e.target.value.match(validRegex)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  };

  const onChangePassword = (e: any) => {
    setPassword(e.target.value);
    if (e.target.value.length >= 3) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  };

  const handleLogin = async () => {
    if (!isEmailValid) {
      setErrorMessage("Incorrect email");
    } else if (!isPasswordValid) {
      setErrorMessage(
        "Incorrect password. It should be minimum 3 characters long"
      );
    } else {
      try {
        setErrorMessage("");
        setIsLoading(true);
        const res = await api.login({ Email: email, Password: password });
        const user: User = {
          nickname: res.user.Nickname,
          email: res.user.Email,
          phoneNumber: res.user.PhoneNumber,
          birthDate: res.user.BirthDate,
          userType: res.user.Usertype,
          userID: res.user.UserID,
          JWT: res.user.access,
          refresh: res.user.refresh,
        };
        logIn(user);
        navigate("/");
      } catch (error: any) {
        if (
          error.response.request.status == 400 ||
          error.response.request.status == 401
        ) {
          toast({
            title: "Wrong credentials. Try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      }
    }
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Text fontSize="24px" fontWeight="600" align="left">
        Sign in
      </Text>
      <Input
        width="20vw"
        type="email"
        heading="Email Address"
        onChange={onChangeEmail}
        value={email}
      />
      <Input
        width="20vw"
        type="password"
        heading="Password"
        onChange={onChangePassword}
        value={password}
      />
      {errorMessage !== "" && (
        <Text fontSize="12px" color="red">
          {errorMessage}
        </Text>
      )}
      <Text fontSize="12px" w="100%" textAlign="center">
        Don't have an account?{" "}
        <Link color="#2dc2e9" onClick={() => navigate("/register")}>
          Create one
        </Link>
      </Text>
      <Button
        onClick={handleLogin}
        bgColor="#2dc2e9"
        mt="16px"
        width="100%"
        borderRadius="20px"
        color="white"
        _hover={{ bgColor: "primary", opacity: "0.9" }}
      >
        Login
      </Button>
    </Flex>
  );
};
