import { Button, Flex, Link, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Input } from "../components/shared/Input";
import useUserContext, { User } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { LoggingState } from "../provider/user";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isBirthDateValid, setIsBirthDateValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isLoggedIn, logIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === LoggingState.Logged) {
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

  const onChangeNickname = (e: any) => {
    setNickname(e.target.value);
    if (e.target.value.length >= 3) {
      setIsNicknameValid(true);
    } else {
      setIsNicknameValid(false);
    }
  };

  const onChangePhoneNumber = (e: any) => {
    setPhoneNumber(e.target.value);
    var validRegex = /^\+(\d{10,13})$/;
    if (e.target.value.match(validRegex)) {
      setIsPhoneNumberValid(true);
    } else {
      setIsPhoneNumberValid(false);
    }
  };

  const onChangeBirthDate = (e: any) => {
    setBirthDate(e.target.value);

    if (e.target.value !== "") {
      setIsBirthDateValid(true);
    } else {
      setIsBirthDateValid(false);
    }
  };

  const handleRegister = async () => {
    if (!isNicknameValid) {
      setErrorMessage(
        "Incorrect nickname. It should be minimum 3 characters long"
      );
    } else if (!isEmailValid) {
      setErrorMessage("Incorrect email");
    } else if (!isPhoneNumberValid) {
      setErrorMessage("Incorrect phone number");
    } else if (!isBirthDateValid) {
      setErrorMessage("You have to fill your birth date.");
    } else if (!isPasswordValid) {
      setErrorMessage(
        "Incorrect password. It should be minimum 3 characters long"
      );
    } else {
      try {
        setErrorMessage("");
        setIsLoading(true);
        await api.register({
          Nickname: nickname,
          Email: email,
          PhoneNumber: phoneNumber,
          BirthDate: birthDate,
          Password: password,
        });
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
        if (error.response.request.status == 400) {
          toast({
            title: "Email, nickname or phone number is already used in base",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      }
      setIsLoading(false);
    }
  };
  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Text fontSize="24px" fontWeight="600" align="left">
        Sign up
      </Text>
      <Input
        width="20vw"
        heading="Nickname"
        value={nickname}
        onChange={onChangeNickname}
      />
      <Input
        width="20vw"
        type="email"
        heading="Email Address"
        value={email}
        onChange={onChangeEmail}
      />
      <Input
        width="20vw"
        type="email"
        heading="Phone Number"
        value={phoneNumber}
        onChange={onChangePhoneNumber}
      />
      <Input
        width="20vw"
        type="date"
        heading="Birthday Date"
        value={birthDate}
        onChange={onChangeBirthDate}
      />
      <Input
        width="20vw"
        type="password"
        heading="Password"
        value={password}
        onChange={onChangePassword}
      />
      {errorMessage !== "" && (
        <Text fontSize="12px" color="red">
          {errorMessage}
        </Text>
      )}
      <Text fontSize="12px" w="100%" textAlign="center">
        Already have an account?{" "}
        <Link color="#2dc2e9" onClick={() => navigate("/login")}>
          Log In
        </Link>
      </Text>
      <Button
        onClick={handleRegister}
        bgColor="#2dc2e9"
        mt="16px"
        width="100%"
        borderRadius="20px"
        color="white"
        isLoading={isLoading}
        _hover={{ bgColor: "primary", opacity: "0.9" }}
      >
        Register
      </Button>
    </Flex>
  );
};
