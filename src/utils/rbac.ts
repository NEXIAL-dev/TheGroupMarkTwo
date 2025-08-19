// src/utils/rbac.ts
import { User, Agency } from '@/types/models';

export const isCoreMember = (u?: User) => !!u?.base_roles?.includes('Core Member');

export const isAgencyOwner = (u?: User, agencyId?: string) =>
  !!u?.agency_roles?.includes('Owner') && 
  (agencyId ? u?.agency_id === agencyId : true) ||
  u?.base_roles?.includes('Agency Owner');

export const canPostGroupNotice = isCoreMember;

export const canPostAgencyNotice = (u?: User, agencyId?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyId);

export const canAccessGroupChannel = isCoreMember;

export const canAccessAgencyChannel = (u?: User, agencyId?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyId);

export const canAccessGroupLog = isCoreMember;

export const canAccessAgencyLog = (u?: User, agencyId?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyId);

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'Core Member': return 'Core Member';
    case 'Agency Owner': return 'Agency Owner';
    case 'Owner': return 'Owner';
    case 'Manager': return 'Manager';
    case 'CFO': return 'CFO';
    case 'HR': return 'HR';
    case 'Admin': return 'Admin';
    case 'Member': return 'Member';
    default: return role;
  }
};