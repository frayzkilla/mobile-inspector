// const BASE_URL = "http://158.160.228.123:8777";
const BASE_URL = "https://tvldw-nscan0004.delta.sbrf.ru/mobile-backend/api/v1";

export interface Vsp {
  vsp_id: string;
  vsp_name: string;
  vsp_address: string;
  vsp_timetable: string;
}

export interface Violation {
  id: string;
  comment: string;
  photos: string[];
}

export interface CheckItem {
  check_item_id: string;
  check_item_description: string;
  check_item_document: string;
  check_item_order: number;
  level_id: string;
  level_name: string;
  level_value: number;
  owner_default: string;
  check_item_comment: string | null;
}

export interface Category {
  category_id: string;
  category_name: string;
  category_order: number;
  category_name_eng: string;
  checkitems: CheckItem[];
}

export interface Process {
  process_id: string;
  process_name: string;
  process_type: number;
  process_short_name: string;
  categories: Category[];
}

export const api = {
  async getVsps(): Promise<Vsp[]> {
    const response = await fetch(`${BASE_URL}/objects/objects`);
    console.log("url = ", `${BASE_URL}/objects/objects`);
    const data = await response.json();
    console.log(data);
    return data.data;
  },

  async getChecklists(): Promise<Process[]> {
    const response = await fetch(`${BASE_URL}/checklists/checklists`);
    const data = await response.json();
    return data.processes;
  },
};
