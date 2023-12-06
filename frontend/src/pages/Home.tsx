import { useEffect, useState } from "react";
import useUserContext from "../provider/user";
import { useNavigate } from "react-router-dom";
import { LoggingState } from "../provider/user";
import api from "../api/api";
import { Flex, Select, Table, Tbody, Td, Text, Th, Tr } from "@chakra-ui/react";
import { Input } from "../components/shared/Input";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export const Home = () => {
  const { user, isLoggedIn } = useUserContext();
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);
  const [startingDate, setStartingDate] = useState("");
  const [stats, setStats] = useState<any | null>(null);

  const series: any = [
    {
      name: "",
      data: [],
    },
  ];
  const options: any = {
    chart: {
      type: "line",
      zoom: {
        enabled: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
    },
    title: {
      text: "",
      align: "left",
    },
    colors: ["#2dc2e9", "#14171A", "#657786", "#AAB8C2"],
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: [],
      tickAmount: 15,
    },
  };
  const [chartStockData, setChartStockData] = useState<
    ApexAxisChartSeries | undefined
  >(undefined);
  const [chartStockDataOptions, setChartStockDataOptions] = useState<
    ApexOptions | undefined
  >(undefined);
  const [EMAData, setEMAData] = useState<ApexAxisChartSeries | undefined>(
    undefined
  );
  const [EMADataOptions, setEMADataOptions] = useState<ApexOptions | undefined>(
    undefined
  );
  const [stochData, setStochData] = useState<ApexAxisChartSeries | undefined>(
    undefined
  );
  const [stochDataOptions, setStochDataOptions] = useState<
    ApexOptions | undefined
  >(undefined);
  const [onBalanceVolData, setOnBalanceVolData] = useState<
    ApexAxisChartSeries | undefined
  >(undefined);
  const [onBalanceVolDataOptions, setOnBalanceVolDataOptions] = useState<
    ApexOptions | undefined
  >(undefined);
  const [MACDData, setMACDData] = useState<ApexAxisChartSeries | undefined>(
    undefined
  );
  const [MACDDataOptions, setMACDDataOptions] = useState<
    ApexOptions | undefined
  >(undefined);

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

    if (isLoggedIn === LoggingState.NotLogged) {
      navigate("/login");
    } else if (isLoggedIn === LoggingState.Logged) {
      getCompanies();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const getCompanyData = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const res = await api.getAllStockData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const allClose = [];
        const allDates = [];
        for (const stock of res.CompanyStockData.data) {
          allClose.push(stock.Close);
          allDates.push(new Date(stock.Date).toISOString().split("T")[0]);
        }

        let newSeries = JSON.parse(JSON.stringify(series));
        newSeries[0].data = allClose;
        newSeries[0].name = "Close";
        setChartStockData(newSeries);

        let newOptions = JSON.parse(JSON.stringify(options));
        newOptions.xaxis.categories = allDates;
        newOptions.title.text = "Close Price (USD) by Date";
        setChartStockDataOptions(newOptions);
      } else {
        setChartStockData(undefined);
        setChartStockDataOptions(undefined);
      }
    };
    const getEMAData = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const res = await api.getEMAData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const EMA12 = [];
        const EMA26 = [];
        const EMA50 = [];
        const EMA200 = [];
        const allDates = [];
        for (const data of res.EMA12) {
          EMA12.push(data.ema12val.toFixed(2));
          allDates.push(new Date(data.Date).toISOString().split("T")[0]);
        }
        for (const data of res.EMA26) {
          EMA26.push(data.ema26val.toFixed(2));
        }
        for (const data of res.EMA50) {
          EMA50.push(data.ema50val.toFixed(2));
        }
        for (const data of res.EMA200) {
          EMA200.push(data.ema200val.toFixed(2));
        }

        let newSeries = JSON.parse(JSON.stringify(series));
        newSeries[0].data = EMA12;
        newSeries[0].name = "EMA12";
        newSeries.push({ data: EMA26, name: "EMA26" });
        newSeries.push({ data: EMA50, name: "EMA50" });
        newSeries.push({ data: EMA200, name: "EMA200" });
        setEMAData(newSeries);

        let newOptions = JSON.parse(JSON.stringify(options));
        newOptions.xaxis.categories = allDates;
        newOptions.title.text = "Exponential Moving Average (USD) by Date";
        setEMADataOptions(newOptions);
      } else {
        setEMAData(undefined);
        setEMADataOptions(undefined);
      }
    };
    const getStochData = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const res = await api.getStochData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const kfast = [];
        const dfastkslow = [];
        const dslow = [];
        const allDates = [];

        for (const data of res.kfast) {
          kfast.push(data.kfast.toFixed(2));
          allDates.push(new Date(data.Date).toISOString().split("T")[0]);
        }
        for (const data of res.dfastkslow) {
          dfastkslow.push(data.dfast.toFixed(2));
        }
        for (const data of res.dslow) {
          dslow.push(data.dslow.toFixed(2));
        }

        let newSeries = JSON.parse(JSON.stringify(series));
        newSeries[0].data = kfast;
        newSeries[0].name = "kfast";
        newSeries.push({ data: dfastkslow, name: "dfast/kslow" });
        newSeries.push({ data: dslow, name: "dslow" });
        setStochData(newSeries);

        let newOptions = JSON.parse(JSON.stringify(options));
        newOptions.xaxis.categories = allDates;
        newOptions.yaxis = { max: 100, tickAmount: 5 };
        newOptions.title.text = "Stochastic Oscillator 14 3 3 by Date";
        setStochDataOptions(newOptions);
      } else {
        setStochData(undefined);
        setStochDataOptions(undefined);
      }
    };
    const getOnBalanceData = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const res = await api.getOnBalanceData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const onBalanceVolumes = [];
        const allDates = [];

        for (const data of res.OnBalanceVolumes) {
          onBalanceVolumes.push(data.OnBalanceVolume);
          allDates.push(new Date(data.Date).toISOString().split("T")[0]);
        }

        let newSeries = JSON.parse(JSON.stringify(series));
        newSeries[0].data = onBalanceVolumes;
        newSeries[0].name = "on balance volume";
        setOnBalanceVolData(newSeries);

        let newOptions = JSON.parse(JSON.stringify(options));
        newOptions.xaxis.categories = allDates;
        newOptions.title.text = "On Balance Volume (USD) by Date";
        setOnBalanceVolDataOptions(newOptions);
      } else {
        setOnBalanceVolData(undefined);
        setOnBalanceVolDataOptions(undefined);
      }
    };
    const getMACDData = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const res = await api.getMACDData({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const MACD = [];
        const signalLine = [];
        const histogram = [];
        const allDates = [];

        for (const data of res.MACD) {
          MACD.push(data.macdval.toFixed(2));
          allDates.push(new Date(data.Date).toISOString().split("T")[0]);
        }
        for (const data of res.SignalLine) {
          signalLine.push(data.signalval.toFixed(2));
        }
        for (const data of res.Histogram) {
          histogram.push(data.histogramval.toFixed(2));
        }

        let newSeries = JSON.parse(JSON.stringify(series));
        newSeries[0].data = MACD;
        newSeries[0].name = "MACD";
        newSeries.push({ data: signalLine, name: "Signal Line" });
        newSeries.push({ data: histogram, name: "Histogram" });
        setMACDData(newSeries);

        let newOptions = JSON.parse(JSON.stringify(options));
        newOptions.xaxis.categories = allDates;
        newOptions.title.text = [
          "Moving Average Convergence /",
          "Divergence (26 12 9) by Date",
        ];
        setMACDDataOptions(newOptions);
      } else {
        setMACDData(undefined);
        setMACDDataOptions(undefined);
      }
    };
    const getStats = async () => {
      if (currentCompanyId !== null && startingDate !== "") {
        const resRSI = await api.getRSI({
          access: user!.JWT,
          companyID: currentCompanyId,
        });

        const resSMA = await api.getSMA({
          access: user!.JWT,
          companyID: currentCompanyId,
        });

        const resStats = await api.getStats({
          access: user!.JWT,
          companyID: currentCompanyId,
          startingDate: startingDate,
        });

        const resCompany = await api.getCompany({
          companyID: currentCompanyId,
        });

        const resPrediction = await api.getPrediction({
          access: user!.JWT,
          Tick: resCompany.TickerSymbol,
        });

        console.log(resStats);
        const allStats = {
          RSI: resRSI.RSI,
          SMA20: resSMA.SMA20,
          SMA50: resSMA.SMA50,
          SMA200: resSMA.SMA200,
          ChangePercent: resStats.ChangePercent,
          Low: resStats.Low,
          High: resStats.High,
          AvgVolume: resStats.AvgVolume,
          CloseStdDev: resStats.CloseStdev,
          SimpleReturnMean21: resStats.SimpleReturnMean21,
          SimpleReturnStdev21: resStats.SimpleReturnStdev21,
          Stdev21Pred: resPrediction.stdev21PRED,
        };

        setStats(allStats);
      } else {
        setStats(null);
      }
    };
    getStats();
    getCompanyData();
    getOnBalanceData();
    getEMAData();
    getStochData();
    getMACDData();
  }, [currentCompanyId, startingDate]);

  const handleInput = (e: any) => {
    if (e.target.value.length > 0) setCurrentCompanyId(e.target.value);
    else setCurrentCompanyId(null);
  };

  const onChangeStartingDate = (e: any) => {
    setStartingDate(e.target.value);
  };

  return (
    <Flex flexDir="column" gap="16px" align="center" w="100vw">
      <Flex flexDir="column" gap="8px" w="20vw">
        <Text fontSize="24px" fontWeight="600" color="#2dc2e9" align="center">
          View Statistics and Plots
        </Text>
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
        >
          {companies.map((company: any) => (
            <option
              key={company.CompanyID}
              value={company.CompanyID}
            >{`${company.Name}, ${company.TickerSymbol}`}</option>
          ))}
        </Select>
        <Input
          type="date"
          heading="Starting Date"
          value={startingDate}
          onChange={onChangeStartingDate}
        />
      </Flex>
      <Flex align="center" flexDir="row" gap="8px" justifyContent="center">
        {stats !== null && (
          <>
            <Table variant="simple" maxW="20vw">
              <Tbody>
                <Tr>
                  <Th>RSI</Th>
                  <Td>{stats.RSI}</Td>
                </Tr>
                <Tr>
                  <Th>SMA20</Th>
                  <Td>{stats.SMA20}</Td>
                </Tr>
                <Tr>
                  <Th>SMA50</Th>
                  <Td>{stats.SMA50}</Td>
                </Tr>
                <Tr>
                  <Th>SMA200</Th>
                  <Td>{stats.SMA200}</Td>
                </Tr>
                <Tr>
                  <Th>Change Percent</Th>
                  <Td>{stats.ChangePercent}</Td>
                </Tr>
                <Tr>
                  <Th>Lowest Close</Th>
                  <Td>{stats.Low}</Td>
                </Tr>
              </Tbody>
            </Table>
            <Table>
              <Tbody>
                <Tr>
                  <Th>Highest Close</Th>
                  <Td>{stats.High}</Td>
                </Tr>
                <Tr>
                  <Th>Average Volume</Th>
                  <Td>{stats.AvgVolume}</Td>
                </Tr>
                <Tr>
                  <Th>Close Stdev </Th>
                  <Td>{stats.CloseStdDev}</Td>
                </Tr>
                <Tr>
                  <Th>Simple Return Mean (21)</Th>
                  <Td>{stats.SimpleReturnMean21}</Td>
                </Tr>
                <Tr>
                  <Th>Simple Return Mean Stdev (21)</Th>
                  <Td>{stats.SimpleReturnStdev21}</Td>
                </Tr>
                <Tr>
                  <Th color="#2dc2e9">
                    Simple Return Mean Stdev (21) Next Day Prediction
                  </Th>
                  <Td color="#2dc2e9">{stats.Stdev21Pred}</Td>
                </Tr>
              </Tbody>
            </Table>
          </>
        )}
      </Flex>
      <Flex
        w={"100vw"}
        align="center"
        flexDir="row"
        gap="8px"
        justifyContent="center"
        mt="16px"
      >
        {chartStockData !== undefined &&
          chartStockDataOptions !== undefined && (
            <Chart
              options={chartStockDataOptions as any}
              series={chartStockData}
              width="500"
              type="line"
            ></Chart>
          )}
        {onBalanceVolData !== undefined &&
          onBalanceVolDataOptions !== undefined && (
            <Chart
              options={onBalanceVolDataOptions as any}
              series={onBalanceVolData}
              width="500"
              type="line"
            ></Chart>
          )}
      </Flex>
      <Flex
        w={"100vw"}
        align="center"
        flexDir="row"
        gap="8px"
        justifyContent="center"
      >
        {EMAData !== undefined && EMADataOptions !== undefined && (
          <Chart
            options={EMADataOptions as any}
            series={EMAData}
            width="500"
            type="line"
          ></Chart>
        )}
        {stochData !== undefined && stochDataOptions !== undefined && (
          <Chart
            options={stochDataOptions as any}
            series={stochData}
            width="500"
            type="line"
          ></Chart>
        )}
        {MACDData !== undefined && MACDDataOptions !== undefined && (
          <Chart
            options={MACDDataOptions as any}
            series={MACDData}
            width="500"
            type="line"
          ></Chart>
        )}
      </Flex>
    </Flex>
  );
};
