import { Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useUserContext from "../../../provider/user";
import { NavLink } from "./NavLink";
import { NavProfile } from "./NavProfile";

export const Navbar = () => {
  const { user } = useUserContext();
  return (
    <Flex
      p={{ base: "20px 16px", md: "20px 42px", xl: "20px 156px" }}
      bgColor="backgroundPrimary"
      align="center"
      boxShadow="0px 1px 10px -2px rgba(154, 154, 154, 1)"
      w="100vw"
      maxW="100vw"
      justify="space-between"
    >
      <Link to="/">
        <Text fontSize="24px" fontWeight="600" color="#2dc2e9">
          Wicks
        </Text>
      </Link>
      <Flex align="center" gap="16px">
        <Flex align="center" gap="24px">
          {user?.userType === "Admin" && (
            <>
              <NavLink
                text="Manage&nbsp;Companies"
                location="/ManageCompanies"
              />
              <NavLink
                text="Manage&nbsp;Stock&nbsp;Markets"
                location="/ManageStockMarkets"
              />
            </>
          )}

          <NavLink text="Stock&nbsp;Data" location="/StockData" />
          <NavLink text="Companies" location="/Companies" />
          <NavLink text="Stock&nbsp;Markets" location="/StockMarkets" />
          <NavProfile />
        </Flex>
      </Flex>
    </Flex>
  );
};
