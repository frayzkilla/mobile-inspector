import { Ticket } from "../store/types";

export type RootStackParamList = {
  Home: undefined;
  Inspection: { ticket: Ticket };
};
