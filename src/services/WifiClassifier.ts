import { Platform } from "react-native";
import { wifiProfiles } from "../data/wifiProfiles";
import { WifiProfile } from "../types/wifi";

interface RawWifiNetwork {
  SSID: string;
  BSSID: string;
  level: number;
  frequency: number;
  capabilities: string;
}

interface ParsedWifiNetwork {
  SSID: string;
  BSSID: string;
  level: number;
  frequency: number;
  capabilities: string;
  vendor: string;
  rsnFlags: string;
  description: string;
  color: string;
  order: number;
}

const parseRSNFlags = (capabilities: string): string => {
  const flags: string[] = [];

  if (!capabilities.includes("WEP") && !capabilities.includes("WPA")) {
    flags.push("Открытая сеть");
  }
  if (capabilities.includes("WEP")) {
    flags.push("WEP");
  }
  if (capabilities.includes("WPA2") || capabilities.includes("RSN")) {
    if (capabilities.includes("CCMP")) flags.push("AES/CCMP");
    if (capabilities.includes("TKIP")) flags.push("TKIP");
    if (capabilities.includes("PSK")) flags.push("WPA/RSN preshared key");
    if (capabilities.includes("EAP") || capabilities.includes("802.1X"))
      flags.push("802.1x");
  }
  if (capabilities.includes("WPA3")) {
    if (capabilities.includes("SAE")) flags.push("WPA/RSN SAE");
    if (capabilities.includes("OWE")) flags.push("WPA/RSN OWE");
  }

  return flags.length > 0 ? flags.join(", ") : "Открытая сеть";
};

let manufacturerMap: Record<string, string> | null = null;

const loadManufacturerDatabase = async () => {
  if (manufacturerMap) return manufacturerMap;

  if (Platform.OS === "android") {
    const db = require("../../assets/wifi_manufacturers.json");
    manufacturerMap = db;
    return db;
  }

  manufacturerMap = {};
  return manufacturerMap;
};

const manufLookup = (mac: string, db: Record<string, string>): string => {
  if (!mac) return "";

  const cleanMac = mac.replace(/:/g, "").toUpperCase();
  if (cleanMac.length !== 12) return "";

  try {
    const macInt = BigInt(`0x${cleanMac}`);

    for (let mask = 0; mask < 48; mask++) {
      const shifted = macInt >> BigInt(mask);
      const key = `${mask}.${shifted.toString()}`;
      if (db[key]) {
        return db[key];
      }
    }
  } catch (e) {
    return "";
  }

  return "";
};

const getNetworkTrust = (
  ssid: string,
  vendor: string,
  rsnFlags: string,
  profiles: WifiProfile[],
) => {
  if (!ssid) {
    return {
      description: "Широковещательный запрос",
      color: "text-secondary",
      order: 7,
    };
  }

  let isTrusted = false;
  let result = {
    description: "ВНИМАНИЕ! Подозрительная сеть",
    color: "bad-wifi",
    order: 10,
  };

  for (const profile of profiles) {
    let isSsidMatch = false;
    try {
      isSsidMatch = new RegExp(profile.ssid).test(ssid);
    } catch (e) {
      console.error(`Invalid RegEx in profile: ${profile.ssid}`, e);
      continue;
    }

    if (isSsidMatch) {
      for (const config of profile.config) {
        const isVendorMatch = config.validVendors
          ? vendor.includes(config.validVendors)
          : true;
        const isTechMatch = config.validTech
          ? rsnFlags.includes(config.validTech)
          : true;

        if (isVendorMatch && isTechMatch) {
          result = {
            description: profile.description,
            color: profile.color,
            order: profile.order,
          };
          isTrusted = true;
          break;
        }
      }
    }
    if (isTrusted) break;
  }

  return result;
};

export const scanAndClassifyWifi = async (
  rawNetworks: RawWifiNetwork[],
): Promise<ParsedWifiNetwork[]> => {
  const db = await loadManufacturerDatabase();

  const parsedNetworks: ParsedWifiNetwork[] = rawNetworks.map((net) => {
    const vendor = manufLookup(net.BSSID, db);
    const rsnFlags = parseRSNFlags(net.capabilities);
    const trustInfo = getNetworkTrust(net.SSID, vendor, rsnFlags, wifiProfiles);

    return {
      SSID: net.SSID,
      BSSID: net.BSSID,
      level: net.level,
      frequency: net.frequency,
      capabilities: net.capabilities,
      vendor: vendor || "Unknown",
      rsnFlags: rsnFlags,
      description: trustInfo.description,
      color: trustInfo.color,
      order: trustInfo.order,
    };
  });

  parsedNetworks.sort((a, b) => {
    const aScore = a.order * 1000 + a.level;
    const bScore = b.order * 1000 + b.level;
    return bScore - aScore;
  });

  return parsedNetworks;
};
