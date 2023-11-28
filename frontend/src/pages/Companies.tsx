import { useEffect, useState } from "react";
import useUserContext, { LoggingState } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
export const Companies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const { isLoggedIn } = useUserContext();
  const navigate = useNavigate();

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

  useEffect(() => {
    const getCompany = async () => {
      if (currentCompanyId != null) {
        const res = await api.getCompany({
          companyID: currentCompanyId,
        });
        const company: {
          Name: string;
          TickerSymbol: string;
          Country: string;
          FoundationDate: Date;
          Description: string;
          StockMarkets: string;
        } = {
          Name: res.Name,
          TickerSymbol: res.TickerSymbol,
          Country: res.Country,
          FoundationDate: res.FoundationDate,
          Description: res.Description,
          StockMarkets: res.StockMarkets.map((data: any) => {
            return data.Name;
          }),
        };
        setCurrentCompany(company);
      } else {
        setCurrentCompany(null);
      }
    };
    getCompany();
  }, [currentCompanyId]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentCompanyId(e.target.value);
    else setCurrentCompanyId(null);
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Flex flexDir="column" gap="8px">
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
      {currentCompany !== null && (
        <Flex flexDir="column" gap="16px" align="center" w="20vw">
          <Table variant="simple" maxW="20vw">
            <Tbody>
              <Tr>
                <Th>Name</Th>
                <Td>{currentCompany.Name}</Td>
              </Tr>
              <Tr>
                <Th>Ticker Symbol</Th>
                <Td>{currentCompany.TickerSymbol}</Td>
              </Tr>
              <Tr>
                <Th>Country</Th>
                <Td>{currentCompany.Country}</Td>
              </Tr>
              <Tr>
                <Th>Foundation Date</Th>
                <Td>
                  {
                    new Date(currentCompany.FoundationDate)
                      .toISOString()
                      .split("T")[0]
                  }
                </Td>
              </Tr>
              <Tr>
                <Th>Stock Markets</Th>
                <Td>
                  {currentCompany.StockMarkets.map(
                    (element: any, index: number, array: any[]) => {
                      if (array.length - index - 1 > 0) {
                        return element + ", ";
                      } else {
                        return element;
                      }
                    }
                  )}
                </Td>
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
            {currentCompany.Description}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
