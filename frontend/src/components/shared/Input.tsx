import { Flex, Text, Input as ChakraInput } from "@chakra-ui/react";
import React, { FC } from "react";

interface IInputProps {
  width?: string;
  onChange?: (e: any) => void;
  heading?: string;
  type?: string;
  value?: string;
}

export const Input: FC<IInputProps> = ({
  width,
  onChange,
  heading,
  type,
  value,
}) => {
  return (
    <Flex flexDir="column" gap="8px" w={width}>
      {heading && <Text fontSize="16px">{heading}</Text>}
      <ChakraInput
        value={value}
        type={type}
        border="1px solid #696F8C"
        focusBorderColor="#696F8C"
        alignItems="center"
        _hover={{ border: "1px solid rgba(0, 0, 0, 0.9)" }}
        _placeholder={{ color: "textPrimary", fontSize: "16px" }}
        onChange={onChange}
        fontSize="16px"
        borderRadius="20px"
      />
    </Flex>
  );
};
