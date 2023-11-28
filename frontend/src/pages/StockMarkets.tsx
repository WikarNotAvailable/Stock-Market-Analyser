import { useEffect, useState } from "react";
import useUserContext, { LoggingState } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Flex, Select, Table, Tbody, Td, Text, Th, Tr } from "@chakra-ui/react";

export const StockMarkets = () => {
  const [stockMarkets, setStockMarkets] = useState<any[]>([]);
  const [currentStockMarketId, setCurrentStockMarketId] = useState<
    number | null
  >(null);
  const [currentStockMarket, setCurrentStockMarket] = useState<any>(null);
  const { isLoggedIn } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getStockMarkets = async () => {
      const res = await api.getStockMarkets();
      const stockMarketsLabels = [];
      for (const stockMarket of res.stock_markets.data) {
        const stockMarketLabel: {
          StockMarketID: number;
          Name: string;
          Abbreviation: string;
        } = {
          StockMarketID: stockMarket.StockMarketID,
          Name: stockMarket.Name,
          Abbreviation: stockMarket.Abbreviation,
        };
        stockMarketsLabels.push(stockMarketLabel);
      }
      setStockMarkets(stockMarketsLabels);
    };

    if (isLoggedIn === LoggingState.Logged) {
      getStockMarkets();
    } else if (isLoggedIn === LoggingState.NotLogged) {
      navigate("/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const getStockMarket = async () => {
      if (currentStockMarketId != null) {
        const res = await api.getStockMarket({
          stockMarketID: currentStockMarketId,
        });
        const stockMarket: {
          Name: string;
          Abbreviation: string;
          Country: string;
          FoundationDate: Date;
          Description: string;
          Localization: string;
          NumberOfCompanies: number;
        } = {
          Name: res.Name,
          Abbreviation: res.Abbreviation,
          Country: res.Country,
          FoundationDate: res.FoundationDate,
          Description: res.Description,
          Localization: res.Localization,
          NumberOfCompanies: res.NumberOfCompanies,
        };
        setCurrentStockMarket(stockMarket);
      } else {
        setCurrentStockMarket(null);
      }
    };
    getStockMarket();
  }, [currentStockMarketId]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentStockMarketId(e.target.value);
    else setCurrentStockMarketId(null);
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Flex flexDir="column" gap="8px">
        <Text fontSize="16px" align="left">
          Stock&nbsp;Market
        </Text>
        <Select
          placeholder="Select stock market"
          name="StockMarketID"
          color="textPrimary"
          border="1px solid #696F8C"
          focusBorderColor="#696F8C"
          _hover={{ border: "1px solid rgba(0, 0, 0, 0.9)" }}
          borderRadius="20px"
          onChange={handleInput}
          w="20vw"
        >
          {stockMarkets.map((stockMarket: any) => (
            <option
              key={stockMarket.StockMarketID}
              value={stockMarket.StockMarketID}
            >{`${stockMarket.Name}, ${stockMarket.Abbreviation}`}</option>
          ))}
        </Select>
      </Flex>
      {currentStockMarket !== null && (
        <Flex flexDir="column" gap="16px" align="center" w="20vw">
          <Table variant="simple" maxW="20vw">
            <Tbody>
              <Tr>
                <Th>Name</Th>
                <Td>{currentStockMarket.Name}</Td>
              </Tr>
              <Tr>
                <Th>Abbreviation</Th>
                <Td>{currentStockMarket.Abbreviation}</Td>
              </Tr>
              <Tr>
                <Th>Country</Th>
                <Td>{currentStockMarket.Country}</Td>
              </Tr>
              <Tr>
                <Th>Foundation Date</Th>
                <Td>
                  {
                    new Date(currentStockMarket.FoundationDate)
                      .toISOString()
                      .split("T")[0]
                  }
                </Td>
              </Tr>
              <Tr>
                <Th>Localization</Th>
                <Td>{currentStockMarket.Localization}</Td>
              </Tr>
              <Tr>
                <Th>Number of Companies</Th>
                <Td>{currentStockMarket.NumberOfCompanies}</Td>
              </Tr>
            </Tbody>
          </Table>
          <Text
            fontSize="16px"
            align="left"
            color="textPrimary"
            mt="24px"
            maxW="20vw"
          >
            {currentStockMarket.Description}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
