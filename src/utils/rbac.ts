// src/utils/rbac.ts
import { User, Agency } from '@/types/models';

export const isCoreMember = (u?: User) => !!u?.base_roles.includes('Core Member');

export const isAgencyOwner = (u?: User, agencyName?: string) =>
  !!u?.agency_role.includes('Owner') && 
  (agencyName ? u?.agency_name === agencyName : true) ||
  u?.base_roles.includes('Agency Owner');

export const canPostGroupNotice = isCoreMember;

export const canPostAgencyNotice = (u?: User, agencyName?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyName);

export const canAccessGroupChannel = isCoreMember;

export const canAccessAgencyChannel = (u?: User, agencyName?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyName);

export const canAccessGroupLog = isCoreMember;

export const canAccessAgencyLog = (u?: User, agencyName?: string) =>
  isCoreMember(u) || isAgencyOwner(u, agencyName);

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'Core Member': return 'Core Member';
    case 'Agency Owner': return 'Agency Owner';
    case 'Owner': return 'Owner';
    case 'Manager': return 'Manager';
    case 'HR': return 'HR';
    case 'Admin': return 'Admin';
    case 'Member': return 'Member';
    default: return role;
  }
};