// src/types/models.ts
export type RoleBase = 'CORE_MEMBER' | 'AGENCY_OWNER';       // base roles (non-exclusive)
export type AgencyRole = 'OWNER' | 'ADMIN' | 'MEMBER';        // future-ready

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  themeUrl?: string;
  baseRoles: RoleBase[];            // e.g. ['CORE_MEMBER','AGENCY_OWNER']
  agencyRoles: { agencyId: string; roles: AgencyRole[] }[]; // owner now, flexible later
  email: string;
  // Never store plaintext; backend returns tokens only. Shown here for shape parity.
  passwordHash?: string;
  agencyPasswordHash?: string;
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