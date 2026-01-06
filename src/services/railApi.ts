import { ApiResponse } from '../types';

const HUXLEY_BASE_URL = 'https://huxley2.azurewebsites.net';

export class RailApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getDepartures(stationCode: string, numRows: number = 10): Promise<ApiResponse> {
    const url = `${HUXLEY_BASE_URL}/departures/${stationCode}/${numRows}?accessToken=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch departures: ${response.statusText}`);
    }

    return response.json();
  }

  static saveApiKey(key: string): void {
    localStorage.setItem('rail_api_key', key);
  }

  static getApiKey(): string | null {
    return localStorage.getItem('rail_api_key');
  }

  static clearApiKey(): void {
    localStorage.removeItem('rail_api_key');
  }

  static saveStationCode(code: string): void {
    localStorage.setItem('rail_station_code', code);
  }

  static getStationCode(): string | null {
    return localStorage.getItem('rail_station_code');
  }

  static clearStationCode(): void {
    localStorage.removeItem('rail_station_code');
  }

  static clearAll(): void {
    this.clearApiKey();
    this.clearStationCode();
  }
}
