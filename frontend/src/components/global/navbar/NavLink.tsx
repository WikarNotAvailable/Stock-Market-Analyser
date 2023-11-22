import { Text } from "@chakra-ui/react";
import { FC } from "react";
import { Link } from "react-router-dom";

interface INavLinkProps {
  text: string;
  location: string;
}

export const NavLink: FC<INavLinkProps> = ({ text, location }) => {
  return (
    <Link to={`${location}`}>
      <Text color="textPrimary" fontSize="16px" _hover={{ opacity: "0.7" }}>
        {text}
      </Text>
    </Link>
  );
};
