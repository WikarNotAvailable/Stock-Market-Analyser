import { useEffect, useState } from "react";
import useUserContext, { LoggingState } from "../provider/user";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Button,
  Flex,
  Select,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Input } from "../components/shared/Input";
import { ConfirmDeleteButton } from "../components/shared/ConfirmDeleteButton";

enum Action {
  Modify = "Modify",
  Add = "Add",
}
export const ManageStockMarkets = () => {
  const [stockMarkets, setStockMarkets] = useState<any[]>([]);
  const [currentStockMarketId, setCurrentStockMarketId] = useState<
    number | null
  >(null);
  const [action, setAction] = useState<Action>(Action.Add);
  const [abbreviation, setAbbreviation] = useState("");
  const [foundationDate, setFoundationDate] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [localization, setLocalization] = useState("");
  const [numberOfCompanies, setNumberOfCompanies] = useState("");
  const { isLoggedIn, user } = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (isLoggedIn === LoggingState.Logged && user?.userType === "Admin") {
      getStockMarkets();
    } else if (
      isLoggedIn === LoggingState.NotLogged ||
      (isLoggedIn === LoggingState.Logged && user?.userType !== "Admin")
    ) {
      navigate("/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const getStockMarket = async () => {
      if (currentStockMarketId != null) {
        const res = await api.getStockMarket({
          stockMarketID: currentStockMarketId,
        });

        setName(res.Name);
        setAbbreviation(res.Abbreviation);
        setCountry(res.Country);
        setFoundationDate(
          new Date(res.FoundationDate).toISOString().split("T")[0]
        );
        setDescription(res.Description);
        setLocalization(res.Localization);
        setNumberOfCompanies(res.NumberOfCompanies);
      } else {
        setName("");
        setAbbreviation("");
        setCountry("");
        setFoundationDate("");
        setDescription("");
        setLocalization("");
        setNumberOfCompanies("");
      }
    };
    getStockMarket();
  }, [currentStockMarketId]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentStockMarketId(e.target.value);
    else setCurrentStockMarketId(null);
  };

  const onChangeAbbreviation = (e: any) => {
    setAbbreviation(e.target.value);
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

  const onChangeLocalization = (e: any) => {
    setLocalization(e.target.value);
  };

  const onChangeNumberOfCompanies = (e: any) => {
    setNumberOfCompanies(e.target.value);
  };

  const changeAction = async () => {
    setIsLoading(true);

    setAction(action === Action.Add ? Action.Modify : Action.Add);
    setCurrentStockMarketId(null);
    setAbbreviation("");
    setFoundationDate("");
    setName("");
    setCountry("");
    setDescription("");
    setLocalization("");
    setNumberOfCompanies("");

    setIsLoading(false);
  };

  const areFieldsFilled = () => {
    if (
      foundationDate === "" ||
      abbreviation === "" ||
      name === "" ||
      country === "" ||
      description === "" ||
      localization === "" ||
      numberOfCompanies === null
    ) {
      return false;
    } else {
      return true;
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.deleteStockMarket({
        access: user!.JWT,
        stockMarketID: currentStockMarketId,
      });
      toast({
        title: "Stock market has been deleted",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      getStockMarkets();
    } catch (error: any) {
      toast({
        title: "Something went wrong. Try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setCurrentStockMarketId(null);
    setAbbreviation("");
    setFoundationDate("");
    setName("");
    setCountry("");
    setDescription("");
    setLocalization("");
    setNumberOfCompanies("");
    setAction(Action.Add);
    setIsLoading(false);
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
    } else if (isNaN(parseInt(numberOfCompanies))) {
      toast({
        title: "Number of companies must be a number",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } else if (action === Action.Add) {
      try {
        await api.postStockMarket({
          access: user!.JWT,
          Abbreviation: abbreviation,
          Name: name,
          Country: country,
          FoundationDate: foundationDate,
          Description: description,
          Localization: localization,
          NumberOfCompanies: parseInt(numberOfCompanies),
        });

        toast({
          title: "Stock market has been added",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        getStockMarkets();
        setAbbreviation("");
        setFoundationDate("");
        setName("");
        setCountry("");
        setDescription("");
        setLocalization("");
        setNumberOfCompanies("");
      } catch (error: any) {
        toast({
          title: "One of the fields might be too long",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      try {
        await api.updateStockMarket({
          access: user!.JWT,
          stockMarketID: currentStockMarketId,
          Abbreviation: abbreviation,
          Name: name,
          Country: country,
          FoundationDate: foundationDate,
          Description: description,
          Localization: localization,
          NumberOfCompanies: parseInt(numberOfCompanies),
        });

        toast({
          title: "Stock Market has been updated",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        getStockMarkets();
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

  return (
    <Flex flexDir="column" gap="16px" align="center" w="20vw">
      <Flex flexDir="column" gap="8px" w="20vw">
        <Text fontSize="24px" fontWeight="600" color="#2dc2e9" align="center">
          {action === Action.Add ? "Add Stock Market" : "Modify Stock Market"}
        </Text>
        {action === Action.Modify && (
          <>
            <Text fontSize="16px" align="left">
              Stock Market
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
          </>
        )}

        {(action === Action.Add ||
          (action === Action.Modify && currentStockMarketId !== null)) && (
          <>
            <Input
              width="20vw"
              heading="Abbreviation"
              value={abbreviation}
              onChange={onChangeAbbreviation}
            />
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
            <Input
              width="20vw"
              heading="Localization"
              value={localization}
              onChange={onChangeLocalization}
            />
            <Input
              width="20vw"
              heading="Number of Companies"
              value={numberOfCompanies}
              onChange={onChangeNumberOfCompanies}
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
                  itemName="Stock Market"
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
