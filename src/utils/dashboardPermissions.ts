import { StoreMatrix, FlattenedSection } from '@/types/dashboard.types';

export const buildFullAccessPermissions = (): Record<string, boolean> => {
  return {
    'dashboard': true,
    'products-management': true,
    'categories-management': true,
    'bidding-system': true,
    'logistics-management': true,
    'warehouse-management': true,
    'orders-management': true,
    'reports-analytics': true,
    'support-tickets': true,
    'settings-interface': true,
    'loyalty-program': true,
    'subscription': true,
    'wallet': true,
    'sliders-management': true,
    'unavailable-orders': true,
  };
};

export const buildDefaultAccessPermissions = (): Record<string, boolean> => {
  return {
    'dashboard': true,
    'products-management': true,
    'categories-management': true,
    'orders-management': true,
    'reports-analytics': true,
    'support-tickets': true,
    'loyalty-program': false,
    'subscription': false,
    'wallet': false,
    'bidding-system': false,
    'logistics-management': false,
    'warehouse-management': false,
    'settings-interface': false,
    'sliders-management': false,
    'unavailable-orders': false,
  };
};

export const buildMerchantAliasMap = (
  merchants: any[]
): Map<string, string> => {
  const map = new Map<string, string>();

  merchants.forEach((merchant) => {
    if (merchant.id && merchant.alias) {
      map.set(merchant.id, merchant.alias);
    }
  });

  return map;
};

export const hasPermission = (
  permissions: Record<string, boolean>,
  section: string
): boolean => {
  return permissions[section] === true;
};

export const getAccessibleSections = (
  allSections: FlattenedSection[],
  permissions: Record<string, boolean>
): FlattenedSection[] => {
  return allSections.filter((section) => hasPermission(permissions, section.id));
};

export const checkRequiredSections = (
  permissions: Record<string, boolean>,
  requiredSections: Set<string>
): boolean => {
  return Array.from(requiredSections).every((section) =>
    hasPermission(permissions, section)
  );
};

export const updatePermissions = (
  currentPermissions: Record<string, boolean>,
  updates: Record<string, boolean>
): Record<string, boolean> => {
  return {
    ...currentPermissions,
    ...updates,
  };
};

export const revokePermissions = (
  currentPermissions: Record<string, boolean>,
  sectionsToRevoke: string[]
): Record<string, boolean> => {
  const updated = { ...currentPermissions };
  sectionsToRevoke.forEach((section) => {
    updated[section] = false;
  });
  return updated;
};

export const grantPermissions = (
  currentPermissions: Record<string, boolean>,
  sectionsToGrant: string[]
): Record<string, boolean> => {
  const updated = { ...currentPermissions };
  sectionsToGrant.forEach((section) => {
    updated[section] = true;
  });
  return updated;
};

export const calculatePermissionScore = (
  permissions: Record<string, boolean>
): number => {
  const granted = Object.values(permissions).filter((v) => v === true).length;
  const total = Object.keys(permissions).length;
  return Math.round((granted / total) * 100);
};

export const buildPermissionMatrix = (
  merchants: any[],
  sections: FlattenedSection[]
): StoreMatrix => {
  const matrix: StoreMatrix = {};

  merchants.forEach((merchant) => {
    if (merchant && merchant.id) {
      const merchantId = merchant.id;
      const merchantMatrix: Record<string, boolean> = {};
      matrix[merchantId] = merchantMatrix;
      sections.forEach((section) => {
        merchantMatrix[section.id] = merchant.permissions?.[section.id] ?? false;
      });
    }
  });

  return matrix;
};

export const exportPermissions = (
  permissions: Record<string, boolean>,
  format: 'json' | 'csv' = 'json'
): string => {
  if (format === 'json') {
    return JSON.stringify(permissions, null, 2);
  }

  const lines = Object.entries(permissions).map(
    ([section, granted]) => `${section},${granted}`
  );
  return ['Section,Granted', ...lines].join('\n');
};

export const importPermissions = (
  data: string,
  format: 'json' | 'csv' = 'json'
): Record<string, boolean> => {
  if (format === 'json') {
    return JSON.parse(data);
  }

  const lines = data.trim().split('\n');
  const permissions: Record<string, boolean> = {};

  lines.slice(1).forEach((line) => {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const section = parts[0];
      const granted = parts[1];
      if (section) {
        permissions[section] = granted === 'true';
      }
    }
  });

  return permissions;
};

export const validatePermissions = (
  permissions: Record<string, boolean>,
  requiredSections: Set<string>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const section of requiredSections) {
    if (!permissions[section]) {
      errors.push(`Missing required permission: ${section}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getMissingPermissions = (
  currentPermissions: Record<string, boolean>,
  requiredPermissions: string[]
): string[] => {
  return requiredPermissions.filter((perm) => !currentPermissions[perm]);
};

export const auditPermissionChanges = (
  oldPermissions: Record<string, boolean>,
  newPermissions: Record<string, boolean>,
  changedBy: string
): Array<{ section: string; oldValue: boolean; newValue: boolean; timestamp: string; changedBy: string }> => {
  const changes: Array<{
    section: string;
    oldValue: boolean;
    newValue: boolean;
    timestamp: string;
    changedBy: string;
  }> = [];

  for (const [section, newValue] of Object.entries(newPermissions)) {
    const oldValue = oldPermissions[section] ?? false;
    if (oldValue !== newValue) {
      changes.push({
        section,
        oldValue,
        newValue,
        timestamp: new Date().toISOString(),
        changedBy,
      });
    }
  }

  return changes;
};
