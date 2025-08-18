// src/utils/rbac.ts
import { User, Agency } from '@/types/models';

export const isCoreMember = (u?: User) => !!u?.baseRoles.includes('CORE_MEMBER');

export const isAgencyOwner = (u?: User, agencyId?: string) =>
  !!u?.agencyRoles.find(a => a.agencyId === agencyId && a.roles.includes('OWNER')) ||
  u?.baseRoles.includes('AGENCY_OWNER');

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
    case 'CORE_MEMBER': return 'Core Member';
    case 'AGENCY_OWNER': return 'Agency Owner';
    case 'OWNER': return 'Owner';
    case 'ADMIN': return 'Admin';
    case 'MEMBER': return 'Member';
    default: return role;
  }
};