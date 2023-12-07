import { useEffect, useState } from "react";
import useUserContext, { LoggingState } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Button,
  Checkbox,
  Flex,
  Select,
  Text,
  Textarea,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { Input } from "../components/shared/Input";
import { ConfirmDeleteButton } from "../components/shared/ConfirmDeleteButton";

enum Action {
  Modify = "Modify",
  Add = "Add",
}

export const ManageCompanies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [stockMarkets, setStockMarkets] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [action, setAction] = useState<Action>(Action.Add);
  const [tickerSymbol, setTickerSymbol] = useState("");
  const [foundationDate, setFoundationDate] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [stockMarketsIds, setStockMarketsIds] = useState<number[]>([]);
  const { isLoggedIn, user } = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

    if (isLoggedIn === LoggingState.Logged && user?.userType === "Admin") {
      getCompanies();
      getStockMarkets();
    } else if (
      isLoggedIn === LoggingState.NotLogged ||
      (isLoggedIn === LoggingState.Logged && user?.userType !== "Admin")
    ) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const getCompany = async () => {
      if (currentCompanyId != null) {
        const res = await api.getCompany({
          companyID: currentCompanyId,
        });

        setName(res.Name);
        setTickerSymbol(res.TickerSymbol);
        setCountry(res.Country);
        setFoundationDate(
          new Date(res.FoundationDate).toISOString().split("T")[0]
        );
        setDescription(res.Description);
        setStockMarketsIds(
          res.StockMarkets.map((data: any) => {
            return data.ID;
          })
        );
      } else {
        setName("");
        setTickerSymbol("");
        setCountry("");
        setFoundationDate("");
        setDescription("");
        setStockMarketsIds([]);
      }
    };

    getCompany();
  }, [currentCompanyId]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentCompanyId(e.target.value);
    else setCurrentCompanyId(null);
  };

  const onChangeTickerSymbol = (e: any) => {
    setTickerSymbol(e.target.value);
  };

  const onChangeName = (e: any) => {
    setName(e.target.value);
  };

  const onChangeCountry = (e: any) => {
    setCountry(e.target.value);
  };

  const onChangeFoundationDate = (e: any) => {
    setFoundationDate(e.target.value);
  };

  const onChangeDescription = (e: any) => {
    setDescription(e.target.value);
  };

  const changeAction = async () => {
    setIsLoading(true);

    setAction(action === Action.Add ? Action.Modify : Action.Add);
    setCurrentCompanyId(null);
    setTickerSymbol("");
    setFoundationDate("");
    setName("");
    setCountry("");
    setDescription("");
    setStockMarketsIds([]);

    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.deleteCompany({
        access: user!.JWT,
        companyID: currentCompanyId,
      });

      toast({
        title: "Company has been deleted",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      getCompanies();
    } catch (error: any) {
      toast({
        title: "Something went wrong. Try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setCurrentCompanyId(null);
    setTickerSymbol("");
    setFoundationDate("");
    setName("");
    setCountry("");
    setDescription("");
    setStockMarketsIds([]);
    setAction(Action.Add);
    setIsLoading(false);
  };

  const areFieldsFilled = () => {
    if (action === Action.Add && tickerSymbol === "") {
      return false;
    } else if (
      foundationDate === "" ||
      name === "" ||
      country === "" ||
      description === "" ||
      stockMarketsIds.length === 0
    ) {
      return false;
    } else {
      return true;
    }
  };

  const handleAction = async () => {
    setIsLoading(true);
    if (!areFieldsFilled()) {
      toast({
        title: "All fields must be filled",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } else if (action === Action.Add) {
      try {
        await api.postCompany({
          access: user!.JWT,
          TickerSymbol: tickerSymbol,
          Name: name,
          Country: country,
          FoundationDate: foundationDate,
          Description: description,
          StockMarkets: stockMarketsIds,
        });

        toast({
          title: "Company has been added",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        getCompanies();
        setTickerSymbol("");
        setFoundationDate("");
        setName("");
        setCountry("");
        setDescription("");
        setStockMarketsIds([]);
      } catch (error: any) {
        if (error.response?.request.status == 400) {
          toast({
            title: "Incorrect ticker symbol",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        } else {
          toast({
            title: "One of the fields might be too long",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
        }
      }
    } else {
      try {
        await api.updateCompany({
          access: user!.JWT,
          companyID: currentCompanyId,
          Name: name,
          Country: country,
          FoundationDate: foundationDate,
          Description: description,
          StockMarkets: stockMarketsIds,
        });

        toast({
          title: "Company has been updated",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        getCompanies();
      } catch (error: any) {
        toast({
          title: "One of the fields might be too long",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    }
    setIsLoading(false);
  };

  const onCheckboxChange = (id: number) => {
    var index = stockMarketsIds.indexOf(id);
    if (index !== -1) {
      setStockMarketsIds((oldStockMarketIds) => [
        ...oldStockMarketIds.filter((oldID) => oldID !== id),
      ]);
    } else {
      setStockMarketsIds((oldStockMarketIds) => [...oldStockMarketIds, id]);
    }
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Flex flexDir="column" gap="8px" w="20vw">
        <Text fontSize="24px" fontWeight="600" color="#2dc2e9" align="center">
          {action === Action.Add ? "Add Company" : "Modify Company"}
        </Text>
        {action === Action.Modify && (
          <>
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
          </>
        )}

        {action === Action.Add && (
          <Input
            width="20vw"
            heading="Ticker Symbol"
            value={tickerSymbol}
            onChange={onChangeTickerSymbol}
          />
        )}

        {(action === Action.Add ||
          (action === Action.Modify && currentCompanyId !== null)) && (
          <>
            <Input
              width="20vw"
              heading="Name"
              value={name}
              onChange={onChangeName}
            />
            <Input
              width="20vw"
              heading="Country"
              value={country}
              onChange={onChangeCountry}
            />
            <Input
              width="20vw"
              type="date"
              heading="Foundation Date"
              value={foundationDate}
              onChange={onChangeFoundationDate}
            />
            <Text fontSize="16px" align="left">
              Description
            </Text>
            <Textarea
              resize="vertical"
              value={description}
              onChange={onChangeDescription}
              color="textPrimary"
              border="1px solid #696F8C"
              focusBorderColor="#696F8C"
              _hover={{ border: "1px solid rgba(0, 0, 0, 0.9)" }}
              borderRadius="20px"
            />
            <Text fontSize="16px" align="left">
              Stock Markets
            </Text>

            <Wrap spacing="16px">
              {stockMarkets.map((stockMarket: any) => (
                <WrapItem>
                  <Checkbox
                    isChecked={stockMarketsIds.includes(
                      stockMarket.StockMarketID
                    )}
                    onChange={() => onCheckboxChange(stockMarket.StockMarketID)}
                  >{`${stockMarket.Name}, ${stockMarket.Abbreviation}`}</Checkbox>
                </WrapItem>
              ))}
            </Wrap>

            <Flex flexDir="row" gap="8px" align="center" w="20vw">
              <Button
                bgColor="#2dc2e9"
                mt="16px"
                width="100%"
                borderRadius="20px"
                color="white"
                isLoading={isLoading}
                _hover={{ bgColor: "primary", opacity: "0.9" }}
                onClick={handleAction}
              >
                {action === Action.Add ? "Add" : "Modify"}
              </Button>

              {action === Action.Modify && (
                <ConfirmDeleteButton
                  itemName="Company"
                  isLoading={isLoading}
                  onConfirm={handleDelete}
                />
              )}
            </Flex>
          </>
        )}
        <Button
          bgColor="black"
          mt="16px"
          width="100%"
          borderRadius="20px"
          color="white"
          isLoading={isLoading}
          _hover={{ bgColor: "primary", opacity: "0.9" }}
          onClick={changeAction}
        >
          Change Action
        </Button>
      </Flex>
    </Flex>
  );
};
