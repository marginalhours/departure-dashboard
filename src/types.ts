export interface TrainService {
  std: string; // Scheduled time of departure
  etd: string; // Estimated time of departure
  platform: string;
  operator: string;
  destination: Destination[];
  serviceID?: string;
  origin?: Destination[];
}

export interface Destination {
  locationName: string;
  crs: string;
}

export interface StationBoard {
  locationName: string;
  crs: string;
  trainServices?: TrainService[];
  nrccMessages?: string[];
  generatedAt: string;
}

export interface ApiResponse {
  trainServices?: TrainService[];
  locationName: string;
  crs: string;
  nrccMessages?: string[];
  generatedAt: string;
}
