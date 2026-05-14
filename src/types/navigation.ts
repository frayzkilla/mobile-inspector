import { Vsp, Process } from '../services/api';

export type RootStackParamList = {
  Home: undefined;
  VspSelect: undefined;
  ProcessSelect: { vsp: Vsp };
  Checklist: { vsp: Vsp; process: Process };
  Wifi: undefined;
};