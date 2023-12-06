import axios from "axios";
import type { AxiosRequestConfig } from "axios";

class ApiService {
  private baseUrl = "http://127.0.0.1:5000/api/v1";

  private config: AxiosRequestConfig = {
    headers: {
      Authorization: null,
      "Access-Control-Allow-Origin": "*",
    },
  };

  public async register(data: any) {
    const req = await axios.post(
      `${this.baseUrl}/auth/register`,
      data,
      this.config
    );
    return req.data;
  }

  public async login(data: any) {
    const req = await axios.post(
      `${this.baseUrl}/auth/login`,
      data,
      this.config
    );
    return req.data;
  }

  public async refresh(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.refresh}`;
    const req = await axios.get(
      `${this.baseUrl}/auth/token-refresh`,
      this.config
    );
    return req.data;
  }

  public async updateUser(data: any, userID: number) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.put(
      `${this.baseUrl}/users/${userID}`,
      data,
      this.config
    );
    return req.data;
  }

  public async checkUserPassword(data: any, userID: number) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.post(
      `${this.baseUrl}/users/check-password/${userID}`,
      data,
      this.config
    );
    return req.data;
  }

  public async deleteUser(data: any, userID: number) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.delete(
      `${this.baseUrl}/users/${userID}`,
      this.config
    );
    return req.data;
  }

  public async getCompanies() {
    const req = await axios.get(`${this.baseUrl}/companies/`, this.config);
    return req.data;
  }

  public async getCompany(data: any) {
    const req = await axios.get(
      `${this.baseUrl}/companies/${data.companyID}`,
      this.config
    );
    return req.data;
  }

  public async getStockMarkets() {
    const req = await axios.get(`${this.baseUrl}/stock-markets/`, this.config);
    return req.data;
  }

  public async getStockMarket(data: any) {
    const req = await axios.get(
      `${this.baseUrl}/stock-markets/${data.stockMarketID}`,
      this.config
    );
    return req.data;
  }

  public async getStockData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/stock-data/${data.companyID}?page=${data.page}&per_page=50&start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getAllStockData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/stock-data/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async deleteCompany(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.delete(
      `${this.baseUrl}/companies/${data.companyID}`,
      this.config
    );
    return req.data;
  }

  public async postCompany(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.post(
      `${this.baseUrl}/companies/`,
      data,
      this.config
    );
    return req.data;
  }

  public async updateCompany(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.put(
      `${this.baseUrl}/companies/${data.companyID}`,
      data,
      this.config
    );
    return req.data;
  }

  public async deleteStockMarket(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.delete(
      `${this.baseUrl}/stock-markets/${data.stockMarketID}`,
      this.config
    );
    return req.data;
  }

  public async postStockMarket(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.post(
      `${this.baseUrl}/stock-markets/`,
      data,
      this.config
    );
    return req.data;
  }

  public async updateStockMarket(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.put(
      `${this.baseUrl}/stock-markets/${data.stockMarketID}`,
      data,
      this.config
    );
    return req.data;
  }

  public async getEMAData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/EMA/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getStochData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/stochastic-oscillator/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getOnBalanceData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/on-balance-volume/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getMACDData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/MACD/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getRSI(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/RSI/${data.companyID}`,
      this.config
    );
    return req.data;
  }

  public async getSMA(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/SMA/${data.companyID}`,
      this.config
    );
    return req.data;
  }

  public async getStats(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/stats/${data.companyID}?start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }

  public async getPrediction(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/predict/${data.Tick}`,
      this.config
    );
    return req.data;
  }
}

const api = new ApiService();

export default api;
