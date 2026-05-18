export interface WifiProfileConfig {
  validVendors: string;
  validTech: string;
}

export interface WifiProfile {
  ssid: string;
  description: string;
  order: number;
  color: string;
  config: WifiProfileConfig[];
}
