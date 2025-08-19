// src/components/ui/RoleBadge.tsx
import { getRoleDisplayName } from '@/utils/rbac';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
}

export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const getColorClasses = (role: string) => {
    switch (role) {
      case 'Core Member':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Agency Owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Owner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Manager':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'HR':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Member':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${getColorClasses(role)} ${sizeClasses}
      `}
    >
      {getRoleDisplayName(role)}
    </span>
  );
}