import { useEffect, useState } from "react";
import api from "../api/api";
import useUserContext, { LoggingState } from "../provider/user";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Flex,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Input } from "../components/shared/Input";

export const StockData = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [startingDate, setStartingDate] = useState("");
  const [stockData, setStockData] = useState<any[]>([]);
  const [numberOfPages, setNumberOfPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [isLoadingPrev, setIsLoadingPrev] = useState<boolean>(false);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [isDisabledPrev, setIsDisabledPrev] = useState<boolean>(false);
  const [isDisabledNext, setIsDisabledNext] = useState<boolean>(false);
  const { user, isLoggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getStockData = async () => {
      if (currentCompanyId != null && startingDate !== "") {
        const res = await api.getStockData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
          page: 1,
        });
        setNumberOfPages(
          res.CompanyStockData.NumberOfPages === 0
            ? 1
            : res.CompanyStockData.NumberOfPages
        );
        setCurrentPage(res.CompanyStockData.Page);

        const allStockData = [];
        for (const stock of res.CompanyStockData.data) {
          const stockData: {
            Date: Date;
            AdjClose: number;
            Close: number;
            High: number;
            Low: number;
            Open: number;
            Volume: number;
          } = {
            Date: stock.Date,
            AdjClose: stock.AdjClose,
            Close: stock.Close,
            High: stock.High,
            Low: stock.Low,
            Open: stock.Open,
            Volume: stock.Volume,
          };
          allStockData.push(stockData);
        }
        setStockData(allStockData);
      } else {
        setNumberOfPages(null);
        setCurrentPage(null);
        setIsDisabledNext(false);
        setIsDisabledPrev(false);
        setStockData([]);
      }
    };
    getStockData();
  }, [currentCompanyId, startingDate]);

  useEffect(() => {
    if (currentPage === 1 && currentPage === numberOfPages) {
      setIsDisabledPrev(true);
      setIsDisabledNext(true);
    } else if (currentPage === 1 && currentPage !== numberOfPages) {
      setIsDisabledPrev(true);
      setIsDisabledNext(false);
    } else if (currentPage === numberOfPages) {
      setIsDisabledPrev(false);
      setIsDisabledNext(true);
    } else if (currentPage !== 1 && currentPage !== numberOfPages) {
      setIsDisabledPrev(false);
      setIsDisabledNext(false);
    }
  }, [currentPage, numberOfPages]);

  useEffect(() => {
    const getCompanies = async () => {
      const res = await api.getCompanies();
      const companiesLabels = [];
      for (const company of res.companies.data) {
        const companyLabel: {
          CompanyID: number;
          Name: string;
          TickerSymbol: string;
        } = {
          CompanyID: company.CompanyID,
          Name: company.Name,
          TickerSymbol: company.TickerSymbol,
        };
        companiesLabels.push(companyLabel);
      }
      setCompanies(companiesLabels);
    };

    if (isLoggedIn === LoggingState.Logged) {
      getCompanies();
    } else if (isLoggedIn === LoggingState.NotLogged) {
      navigate("/");
    }
  }, [isLoggedIn]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentCompanyId(e.target.value);
    else setCurrentCompanyId(null);
  };

  const onChangeStartingDate = (e: any) => {
    setStartingDate(e.target.value);
  };
  const changePage = async (step: number) => {
    setIsLoadingNext(true);
    setIsLoadingPrev(true);

    const res = await api.getStockData({
      access: user!.JWT,
      companyID: currentCompanyId,
      startingDate: startingDate,
      page: currentPage! + step,
    });
    setNumberOfPages(res.CompanyStockData.NumberOfPages);
    setCurrentPage(res.CompanyStockData.Page);
    const allStockData = [];
    for (const stock of res.CompanyStockData.data) {
      const stockData: {
        Date: Date;
        AdjClose: number;
        Close: number;
        High: number;
        Low: number;
        Open: number;
        Volume: number;
      } = {
        Date: stock.Date,
        AdjClose: stock.AdjClose,
        Close: stock.Close,
        High: stock.High,
        Low: stock.Low,
        Open: stock.Open,
        Volume: stock.Volume,
      };
      allStockData.push(stockData);
    }
    setStockData(allStockData);

    setIsLoadingNext(false);
    setIsLoadingPrev(false);
  };
  const previousPage = async (e: any) => {
    await changePage(-1);
  };

  const nextPage = async (e: any) => {
    await changePage(1);
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="100vw">
      <Flex flexDir="column" gap="8px" w="20vw">
        <Text fontSize="16px" align="left">
          Company
        </Text>
        <Select
          placeholder="Select company"
          name="CompanyID"
          color="textPrimary"
          border="1px solid #696F8C"
          focusBorderColor="#696F8C"
          _hover={{ border: "1px solid rgba(0, 0, 0, 0.9)" }}
          borderRadius="20px"
          onChange={handleInput}
          w="20vw"
        >
          {companies.map((company: any) => (
            <option
              key={company.CompanyID}
              value={company.CompanyID}
            >{`${company.Name}, ${company.TickerSymbol}`}</option>
          ))}
        </Select>
      </Flex>
      <Input
        width="20vw"
        type="date"
        heading="Starting date"
        value={startingDate}
        onChange={onChangeStartingDate}
      />
      {currentCompanyId != null && startingDate !== "" && (
        <>
          <TableContainer>
            <Table variant="striped" colorScheme="twitter">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Close</Th>
                  <Th>AdjClose</Th>
                  <Th>High</Th>
                  <Th>Low</Th>
                  <Th>Open</Th>
                  <Th>Volume</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stockData.map((data: any) => (
                  <Tr>
                    <Td>{new Date(data.Date).toISOString().split("T")[0]}</Td>
                    <Td>{data.Close}</Td>
                    <Td>{data.AdjClose}</Td>
                    <Td>{data.High}</Td>
                    <Td>{data.Low}</Td>
                    <Td>{data.Open}</Td>
                    <Td>{data.Volume}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex flexDir="row" w="20vw" gap="8px" align="center">
            <Button
              isDisabled={isDisabledPrev}
              isLoading={isLoadingPrev}
              bgColor="#2dc2e9"
              mt="16px"
              width="100%"
              borderRadius="20px"
              color="white"
              _hover={{ bgColor: "primary", opacity: "0.9" }}
              onClick={previousPage}
            >
              Previous
            </Button>
            <Button
              isLoading={isLoadingNext}
              isDisabled={isDisabledNext}
              bgColor="#2dc2e9"
              mt="16px"
              width="100%"
              borderRadius="20px"
              color="white"
              _hover={{ bgColor: "primary", opacity: "0.9" }}
              onClick={nextPage}
            >
              Next
            </Button>
          </Flex>
          <Text color="textPrimary" fontSize="16px">
            Page&nbsp;{currentPage}/{numberOfPages}
          </Text>
        </>
      )}
    </Flex>
  );
};
