import * as jwt from 'jsonwebtoken';
import { JwtPayload, ProcurementUser } from '../../strategies/jwt.strategy';

// ============================================================================
// MOCK USER DATA
// ============================================================================

export const mockUser: JwtPayload = {
  sub: 'user-001',
  email: 'user@company.com',
  username: 'regularuser',
  roles: ['viewer'],
  permissions: ['view_purchase_orders', 'view_suppliers', 'view_contracts', 'view_rfq', 'view_analytics'],
  department: 'Operations',
  organizationId: 'org-001',
  sessionId: 'session-001',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockBuyerUser: JwtPayload = {
  sub: 'buyer-001',
  email: 'buyer@company.com',
  username: 'procurementbuyer',
  roles: ['buyer', 'requester'],
  permissions: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'edit_supplier',
    'create_rfq',
    'view_rfq',
    'view_analytics',
  ],
  department: 'Procurement',
  organizationId: 'org-001',
  sessionId: 'session-002',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockManagerUser: JwtPayload = {
  sub: 'manager-001',
  email: 'manager@company.com',
  username: 'procurementmanager',
  roles: ['procurement_manager', 'senior_buyer', 'buyer'],
  permissions: [
    'create_purchase_order',
    'approve_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'create_contract',
    'view_contracts',
    'edit_contract',
    'renew_contract',
    'onboard_supplier',
    'view_suppliers',
    'edit_supplier',
    'create_rfq',
    'view_rfq',
    'view_analytics',
    'export_data',
    'ai_optimization',
  ],
  department: 'Procurement',
  organizationId: 'org-001',
  sessionId: 'session-003',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockAdminUser: JwtPayload = {
  sub: 'admin-001',
  email: 'admin@company.com',
  username: 'procurementadmin',
  roles: ['admin', 'procurement_admin'],
  permissions: [
    'create_purchase_order',
    'approve_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'cancel_purchase_order',
    'create_contract',
    'approve_contract',
    'view_contracts',
    'edit_contract',
    'renew_contract',
    'terminate_contract',
    'onboard_supplier',
    'approve_supplier',
    'view_suppliers',
    'edit_supplier',
    'deactivate_supplier',
    'create_rfq',
    'respond_to_rfq',
    'view_rfq',
    'approve_rfq',
    'view_analytics',
    'export_data',
    'manage_categories',
    'blockchain_operations',
    'ai_optimization',
    'system_administration',
  ],
  department: 'Procurement',
  organizationId: 'org-001',
  sessionId: 'session-004',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockFinanceUser: JwtPayload = {
  sub: 'finance-001',
  email: 'finance@company.com',
  username: 'financeapprover',
  roles: ['finance_approver'],
  permissions: [
    'approve_purchase_order',
    'view_purchase_orders',
    'approve_contract',
    'view_contracts',
    'view_analytics',
  ],
  department: 'Finance',
  organizationId: 'org-001',
  sessionId: 'session-005',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockLegalUser: JwtPayload = {
  sub: 'legal-001',
  email: 'legal@company.com',
  username: 'legalapprover',
  roles: ['legal_approver'],
  permissions: [
    'approve_contract',
    'view_contracts',
    'edit_contract',
    'terminate_contract',
  ],
  department: 'Legal',
  organizationId: 'org-001',
  sessionId: 'session-006',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

export const mockITProcurementUser: JwtPayload = {
  sub: 'it-procurement-001',
  email: 'it-procurement@company.com',
  username: 'itprocurement',
  roles: ['it_procurement', 'buyer'],
  permissions: [
    'create_purchase_order',
    'view_purchase_orders',
    'edit_purchase_order',
    'view_contracts',
    'view_suppliers',
    'create_rfq',
    'view_rfq',
  ],
  department: 'IT',
  organizationId: 'org-001',
  sessionId: 'session-007',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};

// ============================================================================
// JWT TOKEN CREATION UTILITIES
// ============================================================================

export function createTestJwtToken(user: JwtPayload, secret: string = 'test_secret_key'): string {
  return jwt.sign(user, secret, { expiresIn: '1h' });
}

export function createExpiredJwtToken(user: JwtPayload, secret: string = 'test_secret_key'): string {
  const expiredUser = { ...user, exp: Math.floor(Date.now() / 1000) - 3600 }; // 1 hour ago
  return jwt.sign(expiredUser, secret);
}

export function createInvalidJwtToken(): string {
  return 'invalid.jwt.token';
}

// ============================================================================
// PROCUREMENT USER CREATION UTILITIES
// ============================================================================

export function createProcurementUser(payload: JwtPayload): ProcurementUser {
  const procurementUser: ProcurementUser = {
    ...payload,
    id: payload.sub,
    isActive: true,
    lastLogin: new Date(),
    procurementAccess: {
      level: determineProcurementLevel(payload.roles),
      maxOrderValue: getMaxOrderValue(payload.roles),
      approvalLevel: getApprovalLevel(payload.roles),
      restrictedCategories: getRestrictedCategories(payload.roles),
      allowedSuppliers: getAllowedSuppliers(payload.roles, payload.department),
    },
  };

  return procurementUser;
}

function determineProcurementLevel(roles: string[]): 'read' | 'write' | 'admin' {
  if (roles.includes('procurement_admin') || roles.includes('admin')) {
    return 'admin';
  }
  if (roles.includes('procurement_manager') || roles.includes('buyer')) {
    return 'write';
  }
  return 'read';
}

function getMaxOrderValue(roles: string[]): number {
  if (roles.includes('procurement_admin') || roles.includes('admin')) {
    return Number.MAX_SAFE_INTEGER;
  }
  if (roles.includes('procurement_manager')) {
    return 100000; // $100k
  }
  if (roles.includes('senior_buyer')) {
    return 50000; // $50k
  }
  if (roles.includes('buyer')) {
    return 10000; // $10k
  }
  return 1000; // $1k default
}

function getApprovalLevel(roles: string[]): number {
  if (roles.includes('procurement_admin') || roles.includes('admin')) {
    return 5; // Highest approval level
  }
  if (roles.includes('procurement_manager')) {
    return 4;
  }
  if (roles.includes('senior_buyer')) {
    return 3;
  }
  if (roles.includes('buyer')) {
    return 2;
  }
  return 1; // Basic level
}

function getRestrictedCategories(roles: string[]): string[] {
  const restrictions: string[] = [];

  if (!roles.includes('procurement_admin') && !roles.includes('admin')) {
    if (!roles.includes('it_procurement')) {
      restrictions.push('IT', 'Software', 'Hardware');
    }
    if (!roles.includes('facilities_procurement')) {
      restrictions.push('Facilities', 'Real Estate', 'Construction');
    }
    if (!roles.includes('capital_procurement')) {
      restrictions.push('Capital Equipment', 'Machinery', 'Vehicles');
    }
  }

  return restrictions;
}

function getAllowedSuppliers(roles: string[], department: string): string[] {
  // In a real implementation, this would be fetched from database
  // based on user's role and department restrictions
  if (roles.includes('procurement_admin') || roles.includes('admin')) {
    return []; // No restrictions for admins (empty array means all allowed)
  }

  // Department-specific supplier restrictions could be applied here
  return []; // Return empty for no restrictions, or specific supplier IDs for restrictions
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

export interface AuthTestScenario {
  name: string;
  user: JwtPayload;
  expectedAccess: 'granted' | 'denied';
  expectedStatusCode: number;
}

export function createAuthTestScenarios(): AuthTestScenario[] {
  return [
    {
      name: 'Admin user - full access',
      user: mockAdminUser,
      expectedAccess: 'granted',
      expectedStatusCode: 200,
    },
    {
      name: 'Manager user - management access',
      user: mockManagerUser,
      expectedAccess: 'granted',
      expectedStatusCode: 200,
    },
    {
      name: 'Buyer user - buyer access',
      user: mockBuyerUser,
      expectedAccess: 'granted',
      expectedStatusCode: 200,
    },
    {
      name: 'Viewer user - read only',
      user: mockUser,
      expectedAccess: 'denied',
      expectedStatusCode: 403,
    },
    {
      name: 'Finance user - approval only',
      user: mockFinanceUser,
      expectedAccess: 'denied',
      expectedStatusCode: 403,
    },
    {
      name: 'Legal user - contract only',
      user: mockLegalUser,
      expectedAccess: 'denied',
      expectedStatusCode: 403,
    },
  ];
}

export function createRoleTestMatrix() {
  return {
    'GET /procurement/suppliers': [
      { user: mockAdminUser, expectedStatus: 200 },
      { user: mockManagerUser, expectedStatus: 200 },
      { user: mockBuyerUser, expectedStatus: 200 },
      { user: mockUser, expectedStatus: 200 }, // View access
      { user: mockFinanceUser, expectedStatus: 403 },
    ],
    'POST /procurement/suppliers': [
      { user: mockAdminUser, expectedStatus: 201 },
      { user: mockManagerUser, expectedStatus: 201 },
      { user: mockBuyerUser, expectedStatus: 403 }, // Can't onboard
      { user: mockUser, expectedStatus: 403 },
      { user: mockFinanceUser, expectedStatus: 403 },
    ],
    'POST /procurement/purchase-orders/autonomous': [
      { user: mockAdminUser, expectedStatus: 201 },
      { user: mockManagerUser, expectedStatus: 201 },
      { user: mockBuyerUser, expectedStatus: 201 },
      { user: mockUser, expectedStatus: 403 },
      { user: mockFinanceUser, expectedStatus: 403 },
    ],
    'GET /procurement/analytics/dashboard': [
      { user: mockAdminUser, expectedStatus: 200 },
      { user: mockManagerUser, expectedStatus: 200 },
      { user: mockBuyerUser, expectedStatus: 200 },
      { user: mockUser, expectedStatus: 200 }, // View access
      { user: mockFinanceUser, expectedStatus: 200 }, // Finance can view
    ],
    'POST /procurement/blockchain/contracts/:id/record': [
      { user: mockAdminUser, expectedStatus: 200 },
      { user: mockManagerUser, expectedStatus: 403 }, // No blockchain ops
      { user: mockBuyerUser, expectedStatus: 403 },
      { user: mockUser, expectedStatus: 403 },
      { user: mockFinanceUser, expectedStatus: 403 },
    ],
  };
}

// ============================================================================
// MOCK REQUEST BUILDERS
// ============================================================================

export function createMockRequest(user: ProcurementUser, path: string = '/test', method: string = 'GET') {
  return {
    user,
    path,
    method,
    url: path,
    headers: {
      'user-agent': 'Test Agent',
      authorization: `Bearer test_token`,
    },
    ip: '127.0.0.1',
    body: {},
    query: {},
    params: {},
    audit: {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      department: user.department,
      organizationId: user.organizationId,
      sessionId: user.sessionId,
      timestamp: new Date(),
      endpoint: `${method} ${path}`,
      userAgent: 'Test Agent',
      ip: '127.0.0.1',
    },
  };
}

export function createMockResponse() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    headers: {},
  };

  return response;
}

// ============================================================================
// JWT VERIFICATION MOCK
// ============================================================================

export function mockJwtVerify(token: string, secret: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// ============================================================================
// AUTHENTICATION HEADER BUILDERS
// ============================================================================

export function createAuthHeader(user: JwtPayload, secret: string = 'test_secret_key'): string {
  const token = createTestJwtToken(user, secret);
  return `Bearer ${token}`;
}

export function createInvalidAuthHeader(): string {
  return 'Bearer invalid_token_here';
}

export function createExpiredAuthHeader(user: JwtPayload, secret: string = 'test_secret_key'): string {
  const token = createExpiredJwtToken(user, secret);
  return `Bearer ${token}`;
}

// ============================================================================
// USER ROLE VALIDATION UTILITIES
// ============================================================================

export function hasRole(user: JwtPayload, role: string): boolean {
  return user.roles.includes(role);
}

export function hasPermission(user: JwtPayload, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function hasAnyRole(user: JwtPayload, roles: string[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

export function hasAllPermissions(user: JwtPayload, permissions: string[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

export function canAccessEndpoint(user: JwtPayload, endpoint: string, method: string): boolean {
  const testMatrix = createRoleTestMatrix();
  const endpointKey = `${method} ${endpoint}`;
  const testCases = testMatrix[endpointKey];
  
  if (!testCases) {
    return false; // Endpoint not defined in test matrix
  }

  const userTestCase = testCases.find(testCase => testCase.user.sub === user.sub);
  return userTestCase ? userTestCase.expectedStatus < 400 : false;
}

// ============================================================================
// MOCK DATA FOR SPECIFIC TEST SCENARIOS
// ============================================================================

export const mockHighValueOrder = {
  items: [
    {
      description: 'Enterprise Server Equipment',
      quantity: 10,
      unitPrice: 25000,
      category: 'IT Equipment',
    },
  ],
  priority: 'HIGH',
  department: 'IT',
  budgetLimit: 300000,
};

export const mockRestrictedCategoryOrder = {
  items: [
    {
      description: 'Software License',
      quantity: 100,
      unitPrice: 500,
      category: 'Software',
    },
  ],
  priority: 'MEDIUM',
  department: 'IT',
  budgetLimit: 50000,
};

export const mockStandardOrder = {
  items: [
    {
      description: 'Office Supplies',
      quantity: 50,
      unitPrice: 25,
      category: 'Office',
    },
  ],
  priority: 'LOW',
  department: 'Operations',
  budgetLimit: 2000,
};
