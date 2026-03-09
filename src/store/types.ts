export type Ticket = {
  title: string;
  process: string;
  adress: string;
  checklist_id: number;
};

export type ViolationPhoto = {
  id: string;
  uri: string;
};

export type ViolationInstance = {
  id: string;
  description: string;
  ip?: string;
  photos: ViolationPhoto[];
};

export type ChecklistViolation = {
  name: string;
  level: string;
};

export type ChecklistGroup = {
  group: string;
  violations: ChecklistViolation[];
};

export type Checklist = {
  id: number;
  groups: ChecklistGroup[];
};
