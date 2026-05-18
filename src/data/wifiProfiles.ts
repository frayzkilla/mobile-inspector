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

export const wifiProfiles: WifiProfile[] = [
  {
    ssid: "^Sber$",
    description: "Доверенная сеть",
    order: 3,
    color: "good-wifi",
    config: [
      {
        validVendors: "Huawei Technologies Co.,Ltd",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cisco Systems, Inc",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Prime Electronics & Satellitics Inc.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^Sber-IoT$",
    description: "Доверенная сеть",
    order: 3,
    color: "good-wifi",
    config: [
      {
        validVendors: "Huawei Technologies Co.,Ltd",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Cisco Systems, Inc",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Prime Electronics & Satellitics Inc.",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
    ],
  },
  {
    ssid: "^Sber-Guest$",
    description: "Доверенная сеть",
    order: 3,
    color: "good-wifi",
    config: [
      {
        validVendors: "Huawei Technologies Co.,Ltd",
        validTech: "Открытая сеть",
      },
      {
        validVendors: "Cisco Systems, Inc",
        validTech: "Открытая сеть",
      },
      {
        validVendors: "Prime Electronics & Satellitics Inc.",
        validTech: "Открытая сеть",
      },
    ],
  },
  {
    ssid: "^Sberbank",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^Sberbank1_Client",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^(.*Sber.*)|(.*sber.*)|(.*SBER.*)",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^RTK_DEV",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
    ],
  },
  {
    ssid: "^RTK_SBRF_WIFI",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "Открытая сеть",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "Открытая сеть",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "Открытая сеть",
      },
    ],
  },
  {
    ssid: "^SBRF_\\d{4}_\\d{4,}",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^VSP_RTK",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^TE\\d{2}_wifi_ap_\\d{1,10}",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
    ],
  },
  {
    ssid: "^$",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "Eltex Enterprise Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Digital China (Shanghai) Networks Ltd.",
        validTech: "AES/CCMP, 802.1x",
      },
      {
        validVendors: "Cambium Networks Limited",
        validTech: "AES/CCMP, 802.1x",
      },
    ],
  },
  {
    ssid: "^Nontarget",
    description: "Нецелевая сеть",
    order: 7,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "",
        validTech: "AES/CCMP, WPA/RSN preshared key",
      },
    ],
  },
  {
    ssid: "^(.*Putin.*)|(.*PUTIN.*)|(.*Ukraina.*)|(.*suka.*)|(.*slava.*)",
    description: "Репутационные риски",
    order: 5,
    color: "nontarget-wifi",
    config: [
      {
        validVendors: "",
        validTech: "",
      },
    ],
  },
  {
    ssid: "^huawei_neighbor_discovery$",
    description: "Доверенная сеть",
    order: 3,
    color: "good-wifi",
    config: [
      {
        validVendors: "",
        validTech: "",
      },
    ],
  },
  {
    ssid: "^davinci$",
    description: "CVE-2017-14953",
    order: 50,
    color: "bad-wifi",
    config: [
      {
        validVendors: "",
        validTech: "",
      },
    ],
  },
  {
    ssid: ".*",
    description: "Беспроводная камера",
    order: 50,
    color: "bad-wifi",
    config: [
      {
        validVendors: "Fn-Link Technology Limited",
        validTech: "",
      },
    ],
  },
];
