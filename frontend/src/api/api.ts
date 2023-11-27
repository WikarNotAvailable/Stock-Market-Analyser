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

  public async getStockData(data: any) {
    this.config.headers!.Authorization = `Bearer ${data.access}`;
    const req = await axios.get(
      `${this.baseUrl}/data-provider/stock-data/${data.companyID}?page=${data.page}&per_page=50&start=${data.startingDate}`,
      this.config
    );
    return req.data;
  }
}

const api = new ApiService();

export default api;
