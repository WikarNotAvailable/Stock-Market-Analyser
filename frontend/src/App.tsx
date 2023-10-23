import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { RouterWrapper } from "./components/global/RouterWrapper"

export const App = () => (
  <ChakraProvider theme={theme}>
    <RouterWrapper/>
  </ChakraProvider>
)
