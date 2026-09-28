export const CLIENT_STATUSES = ['Lead', 'Active', 'Inactive', 'Archived'] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export interface Client {
  readonly id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
