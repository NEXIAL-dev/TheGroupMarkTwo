// src/types/models.ts
export type RoleBase = 'Core Member' | 'Agency Owner';       // base roles (non-exclusive)
export type AgencyRole = 'Owner' | 'Manager' | 'HR' | 'Admin' | 'Member';        // future-ready

export interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  background_img?: string;
  themeUrl?: string;
  base_roles: RoleBase[];            // e.g. ['Core Member','Agency Owner']
  agency_role: AgencyRole[];         // ['Owner', 'Manager', etc.]
  agency_name?: string;              // the agency user belongs to
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
}

export type ChannelType = 'GROUP' | 'AGENCY';
export interface Channel {
  id: string;
  type: ChannelType;           // GROUP = Core Members; AGENCY = per-agency
  agencyId?: string;           // required when type === 'AGENCY'
  name: string;
  memberIds: string[];         // resolved by server according to rules
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO
  authorName?: string; // for display
}

export interface LogEntry {
  id: string;
  scope: 'GROUP' | 'AGENCY';
  agencyId?: string;
  text: string;
  createdBy: string; // userId
  createdAt: string;
  createdByName?: string; // for display
}

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'POSTPONED';
export interface Task {
  id: string;
  title: string;
  description?: string;
  createdBy: string;     // userId
  assignedTo: string;    // userId
  dueAt?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  assignedToName?: string;
}

export interface Notice {
  id: string;
  scope: 'GROUP' | 'AGENCY';
  agencyId?: string;
  title: string;
  body: string;
  createdBy: string; // userId
  createdAt: string;
  createdByName?: string;
}

export interface LedgerAccountRef {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  ledgerScope: 'GROUP' | 'AGENCY';
  agencyId?: string;        // present for AGENCY scope
  date: string;             // ISO
  description: string;
  amount: number;           // +credit / -debit or vice-versa (decide convention)
  account: LedgerAccountRef; // e.g., "Agency A (sub-account)" in group ledger
  createdBy: string;
  createdByName?: string;
}