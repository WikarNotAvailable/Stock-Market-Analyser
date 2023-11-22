import { Flex, Text } from "@chakra-ui/react";
import { PageContainer } from "../../shared/PageContainer";

export const Footer = () => {
  return (
    <Flex w="100vw" bgColor="#606075" color="white" fontSize="12px">
      <PageContainer>
        <Flex w="100%" justify="space-between">
          <Text>Copyright © 2023 by Wikar All Rights Reserved.</Text>
          <Text>® Wicks</Text>
        </Flex>
      </PageContainer>
    </Flex>
  );
};
