import { Avatar, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Input } from "../components/shared/Input";
import useUserContext from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { LoggingState } from "../provider/user";
import { ConfirmDeleteButton } from "../components/shared/ConfirmDeleteButton";

export const Profile = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isOldPasswordValid, setIsOldPasswordValid] = useState(false);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isLoggedIn, update, user, logOut } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === LoggingState.NotLogged) {
      navigate("/login");
    } else if (isLoggedIn === LoggingState.Logged) {
      setEmail(user!.email);
      setNickname(user!.nickname);
      setPhoneNumber(user!.phoneNumber);
      setBirthDate(new Date(user!.birthDate).toISOString().split("T")[0]);
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

  const onChangeNewPassword = (e: any) => {
    setNewPassword(e.target.value);
    if (e.target.value.length >= 3) {
      setIsNewPasswordValid(true);
    } else {
      setIsNewPasswordValid(false);
    }
  };

  const onChangeOldPassword = (e: any) => {
    setOldPassword(e.target.value);
    if (e.target.value.length >= 3) {
      setIsOldPasswordValid(true);
    } else {
      setIsOldPasswordValid(false);
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
  };

  const handleDelete = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      await api.deleteUser({ access: user!.JWT }, user!.userID);
      toast({
        title: "Account has been deleted",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      logOut();

      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: "Something went wrong. Try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleModification = async () => {
    if (!isNicknameValid) {
      setErrorMessage(
        "Incorrect nickname. It should be minimum 3 characters long"
      );
    } else if (!isEmailValid) {
      setErrorMessage("Incorrect email");
    } else if (!isPhoneNumberValid) {
      setErrorMessage("Incorrect phone number");
    } else if (!isOldPasswordValid && isChangingPassword) {
      setErrorMessage(
        "Incorrect old password. It is minimum 3 characters long"
      );
    } else if (!isNewPasswordValid && isChangingPassword) {
      setErrorMessage(
        "Incorrect new password. It should be minimum 3 characters long"
      );
    } else {
      setErrorMessage("");
      setIsLoading(true);
      if (isChangingPassword) {
        try {
          const res = await api.checkUserPassword(
            { Password: oldPassword, access: user!.JWT },
            user!.userID
          );

          if (res.isCurrentPassword) {
            const res = await api.updateUser(
              {
                Nickname: nickname,
                Email: email,
                Password: newPassword,
                BirthDate: birthDate,
                PhoneNumber: phoneNumber,
                access: user!.JWT,
              },
              user!.userID
            );

            update({
              ...user,
              nickname: res.Nickname,
              email: res.Email,
              phoneNumber: res.PhoneNumber,
              birthDate: res.BirthDate,
            });

            toast({
              title: "Profil has been updated",
              status: "info",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          } else {
            toast({
              title: "You entered invalid old password",
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          }
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
      } else {
        try {
          const res = await api.updateUser(
            {
              Nickname: nickname,
              Email: email,
              BirthDate: birthDate,
              PhoneNumber: phoneNumber,
              access: user!.JWT,
            },
            user!.userID
          );

          update({
            ...user,
            nickname: res.Nickname,
            email: res.Email,
            phoneNumber: res.PhoneNumber,
            birthDate: res.BirthDate,
          });

          toast({
            title: "Profil has been updated",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
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
      }
      setIsLoading(false);
    }
  };
  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Text fontSize="24px" fontWeight="600" align="left">
        Hello&nbsp;{isLoggedIn === LoggingState.Logged ? user!.nickname : ""}
      </Text>
      <Avatar src="https://bit.ly/broken-link" size="xl" />
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

      {isChangingPassword && (
        <>
          <Input
            width="20vw"
            type="password"
            heading="Old Password"
            value={oldPassword}
            onChange={onChangeOldPassword}
          />
          <Input
            width="20vw"
            type="password"
            heading="New Password"
            value={newPassword}
            onChange={onChangeNewPassword}
          />
        </>
      )}

      {errorMessage !== "" && (
        <Text fontSize="12px" color="red">
          {errorMessage}
        </Text>
      )}
      <Button
        bgColor="black"
        mt="16px"
        width="100%"
        borderRadius="20px"
        color="white"
        isLoading={isLoading}
        _hover={{ bgColor: "primary", opacity: "0.9" }}
        onClick={() => {
          setIsChangingPassword(!isChangingPassword);
        }}
      >
        {isChangingPassword ? "Keep old password" : "Change password"}
      </Button>
      <Flex flexDir="row" gap="8px" align="center" w="20vw">
        <Button
          bgColor="#2dc2e9"
          mt="16px"
          width="100%"
          borderRadius="20px"
          color="white"
          isLoading={isLoading}
          _hover={{ bgColor: "primary", opacity: "0.9" }}
          onClick={handleModification}
        >
          Modify
        </Button>
        <ConfirmDeleteButton
          itemName="Account"
          isLoading={isLoading}
          onConfirm={handleDelete}
        />
      </Flex>
    </Flex>
  );
};
