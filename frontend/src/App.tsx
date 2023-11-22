import * as React from "react";
import { UserContextProvider } from "../src/provider/user";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { RouterWrapper } from "./components/global/RouterWrapper";

export const App = () => (
  <ChakraProvider theme={theme}>
    <UserContextProvider>
      <RouterWrapper />
    </UserContextProvider>
  </ChakraProvider>
);
