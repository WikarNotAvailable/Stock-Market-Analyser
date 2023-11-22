import { Flex } from "@chakra-ui/react";
import React, { FC } from "react";

interface IPageContainerProps {
  isCentered?: boolean;
  children: React.ReactNode;
  props?: any;
}

export const PageContainer: FC<IPageContainerProps> = ({
  children,
  isCentered,
  props,
}) => {
  return (
    <Flex
      {...props}
      flexDir="column"
      align={isCentered ? "center" : "flex-start"}
      px={{ base: "16px", md: "42px", xl: "156px" }}
      py="32px"
      w="100vw"
      maxW="100vw"
      overflow="hidden"
    >
      {children}
    </Flex>
  );
};
