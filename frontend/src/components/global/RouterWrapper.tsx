import { Flex } from '@chakra-ui/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Route, Routes } from 'react-router';
import { Home } from '../../pages/Home';

export const RouterWrapper = () => {
  return (
    <BrowserRouter>
        <Flex maxW='100vw' overflow='hidden' flexDir='column'>
            <Routes>
                <Route path='/' element={<Home/>} />
            </Routes>
        </Flex>
    </BrowserRouter>
  )
}
