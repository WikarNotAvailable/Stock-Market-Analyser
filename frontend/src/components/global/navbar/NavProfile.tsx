import { Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { FC } from "react";
import { MdAccountCircle } from "react-icons/md";
import { Link } from "react-router-dom";
import useUserContext from "../../../provider/user";

export const NavProfile: FC = () => {
  const { logOut, isLoggedIn, user } = useUserContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  return (
    <Flex
      position="relative"
      align="center"
      gap="8px"
      onClick={() => {
        if (isLoggedIn) {
          isOpen ? onClose() : onOpen();
        } else {
          toast({
            title: "You must be logged in to do this.",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      }}
      cursor="pointer"
    >
      {isLoggedIn && (
        <Text fontSize="16px" fontWeight="600">
          {user?.nickname}
        </Text>
      )}
      <MdAccountCircle size="35px" />
      {isOpen && (
        <Flex
          flexDir="column"
          position="absolute"
          top="45px"
          right="0"
          bgColor="backgroundSecondary"
          w="150px"
          borderRadius="20px"
          border="1px solid #696F8C"
          zIndex="1000"
        >
          {isLoggedIn && (
            <>
              <Link to="/profile">
                <Flex
                  borderRadius="20px"
                  p="8px"
                  fontWeight="600"
                  cursor="pointer"
                  justify="center"
                  align="center"
                  fontSize="12px"
                  _hover={{ bgColor: "#696F8C" }}
                >
                  Profile
                </Flex>
              </Link>
              <Flex
                borderRadius="20px"
                p="8px"
                fontWeight="600"
                cursor="pointer"
                justify="center"
                align="center"
                fontSize="12px"
                onClick={logOut}
                _hover={{ bgColor: "#696F8C" }}
              >
                Logout
              </Flex>
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
};
