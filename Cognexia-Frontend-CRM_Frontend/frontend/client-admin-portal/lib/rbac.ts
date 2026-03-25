export type AuthLikeUser =
  | {
      role?: string;
      roles?: string[];
      userType?: string;
      permissions?: string[];
    }
  | null
  | undefined;

export const ROLE_GROUPS = {
  ADMIN: ['SUPER_ADMIN', 'ORG_ADMIN'],
  MANAGERS: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_MANAGER', 'MARKETING_MANAGER'],
  ALL_USERS: ['SUPER_ADMIN', 'ORG_ADMIN', 'ORG_USER', 'SALES_REP', 'SALES_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_AGENT'],
  SALES: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_MANAGER', 'SALES_REP'],
  MARKETING: ['SUPER_ADMIN', 'ORG_ADMIN', 'MARKETING_MANAGER'],
  SUPPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SUPPORT_AGENT'],
} as const;

export const DEFAULT_FALLBACK_ROLES = [...ROLE_GROUPS.ADMIN];

export const ROUTE_ROLE_RULES: Array<{ prefix: string; allowedRoles: string[] }> = [
  { prefix: '/dashboard', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/my-team', allowedRoles: [...ROLE_GROUPS.MANAGERS] },
  { prefix: '/accounts', allowedRoles: [...ROLE_GROUPS.SALES] },
  { prefix: '/customers', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/contacts', allowedRoles: [...ROLE_GROUPS.SALES] },
  { prefix: '/leads', allowedRoles: [...new Set([...ROLE_GROUPS.SALES, ...ROLE_GROUPS.MARKETING])] },
  { prefix: '/opportunities', allowedRoles: [...ROLE_GROUPS.SALES] },
  { prefix: '/team', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/sales', allowedRoles: [...ROLE_GROUPS.SALES] },
  { prefix: '/marketing', allowedRoles: [...ROLE_GROUPS.MARKETING] },
  { prefix: '/support', allowedRoles: [...ROLE_GROUPS.SUPPORT] },
  { prefix: '/products', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/pricing', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/inventory', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/reports', allowedRoles: [...ROLE_GROUPS.MANAGERS] },
  { prefix: '/dashboards', allowedRoles: [...ROLE_GROUPS.MANAGERS] },
  { prefix: '/settings', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/tasks', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/activities', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/calendar', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/documents', allowedRoles: [...ROLE_GROUPS.ALL_USERS] },
  { prefix: '/contracts', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/signatures', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/integration', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/mobile', allowedRoles: [...new Set([...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.SALES])] },
  { prefix: '/calls', allowedRoles: [...new Set([...ROLE_GROUPS.SUPPORT, 'ORG_ADMIN', 'SALES_MANAGER'])] },
  { prefix: '/ai', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/workflow', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/recommendations', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/analytics', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/monitoring', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/performance', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/usage', allowedRoles: [...ROLE_GROUPS.MANAGERS] },
  { prefix: '/throttling', allowedRoles: [...ROLE_GROUPS.ADMIN] },
  { prefix: '/audit-logs', allowedRoles: [...ROLE_GROUPS.ADMIN] },
];

const SORTED_ROUTE_RULES = [...ROUTE_ROLE_RULES].sort(
  (a, b) => b.prefix.length - a.prefix.length,
);

const ROLE_ALIASES: Record<string, string[]> = {
  super_admin: ['super_admin'],
  owner: ['org_admin', 'admin'],
  org_admin: ['admin', 'client_admin', 'owner'],
  admin: ['org_admin', 'client_admin', 'owner'],
  client_admin: ['org_admin', 'admin'],
  org_user: ['user', 'viewer'],
  user: ['org_user', 'viewer'],
  viewer: ['org_user', 'user'],
  manager: ['sales_manager', 'marketing_manager', 'support_manager'],
  sales_manager: [],
  marketing_manager: ['marketing', 'marketing_specialist'],
  marketing_specialist: ['marketing_manager'],
  marketing: ['marketing_manager', 'marketing_specialist'],
  support_manager: ['support_agent', 'customer_success'],
  support_agent: ['customer_success'],
  customer_success: ['support_agent'],
  finance: ['org_admin', 'admin'],
};

export const normalizeAccessValue = (value: unknown): string =>
  String(value || '').trim().toLowerCase();

export const normalizeRoles = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) {
    return [];
  }

  const normalized = roles
    .map((role) => normalizeAccessValue(role))
    .filter((role) => role.length > 0);

  return [...new Set(normalized)];
};

export const expandRoleAliases = (role: string): string[] => {
  const normalizedRole = normalizeAccessValue(role);
  if (!normalizedRole) {
    return [];
  }

  const aliases = new Set<string>([normalizedRole]);
  const mappedRoles = ROLE_ALIASES[normalizedRole] || [];

  for (const mappedRole of mappedRoles) {
    aliases.add(normalizeAccessValue(mappedRole));
  }

  return [...aliases];
};

export const buildExpandedRoleSet = (roles: string[] = []): Set<string> => {
  const expandedRoles = new Set<string>();

  for (const role of roles) {
    for (const alias of expandRoleAliases(role)) {
      expandedRoles.add(alias);
    }
  }

  return expandedRoles;
};

export const extractUserRoles = (user: AuthLikeUser): string[] => {
  if (!user) {
    return [];
  }

  return [
    ...(user.roles || []),
    user.role || '',
    user.userType || '',
  ].filter((role) => normalizeAccessValue(role).length > 0);
};

export const hasAnyRoleAccess = (
  userOrRoles: AuthLikeUser | string[],
  requiredRoles: string[] = [],
): boolean => {
  if (!requiredRoles.length) {
    return false;
  }

  const userRoles = Array.isArray(userOrRoles)
    ? userOrRoles
    : extractUserRoles(userOrRoles);

  const requiredRoleSet = buildExpandedRoleSet(requiredRoles);
  const userRoleSet = buildExpandedRoleSet(userRoles);

  if (userRoleSet.has('super_admin')) {
    return true;
  }

  return [...requiredRoleSet].some((requiredRole) => userRoleSet.has(requiredRole));
};

export const hasPermissionAccess = (
  user: AuthLikeUser,
  permission: string,
): boolean => {
  const normalizedPermission = normalizeAccessValue(permission);
  const normalizedPermissions = (user?.permissions || []).map((item) =>
    normalizeAccessValue(item),
  );

  return (
    normalizedPermissions.includes('*') ||
    normalizedPermissions.includes(normalizedPermission)
  );
};

export const getAllowedRolesForPath = (
  path: string,
): string[] | null => {
  const normalizedPath = normalizeAccessValue(path);
  if (!normalizedPath) {
    return null;
  }

  for (const rule of SORTED_ROUTE_RULES) {
    const normalizedPrefix = normalizeAccessValue(rule.prefix);
    if (
      normalizedPath === normalizedPrefix ||
      normalizedPath.startsWith(`${normalizedPrefix}/`)
    ) {
      return rule.allowedRoles;
    }
  }

  return null;
};

export const canAccessPath = (
  path: string,
  user: AuthLikeUser,
): boolean => {
  const allowedRoles = getAllowedRolesForPath(path);
  if (!allowedRoles?.length) {
    return hasAnyRoleAccess(user, DEFAULT_FALLBACK_ROLES);
  }

  return hasAnyRoleAccess(user, allowedRoles);
};
