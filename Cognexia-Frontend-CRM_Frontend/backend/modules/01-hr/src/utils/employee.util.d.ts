import { UUID } from 'crypto';
/**
 * Generates a unique employee number for a given organization
 * Format: EMP-{YYYY}-{NNNNNN} (e.g., EMP-2024-000001)
 */
export declare function generateEmployeeNumber(organizationId: UUID): Promise<string>;
/**
 * Validates employee data before creation or update
 */
export declare function validateEmployeeData(data: any): {
    isValid: boolean;
    errors: string[];
};
/**
 * Validates email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validates phone number format
 */
export declare function isValidPhoneNumber(phone: string): boolean;
/**
 * Validates date
 */
export declare function isValidDate(date: any): boolean;
/**
 * Calculates age from date of birth
 */
export declare function calculateAge(dateOfBirth: Date): number;
/**
 * Formats employee full name
 */
export declare function formatEmployeeName(firstName: string, lastName: string, middleName?: string): string;
/**
 * Generates display name for employee
 */
export declare function generateDisplayName(firstName: string, lastName: string, preferredName?: string): string;
/**
 * Sanitizes employee data for database insertion
 */
export declare function sanitizeEmployeeData(data: any): any;
/**
 * Checks if employee can be assigned as a manager (no circular reference)
 */
export declare function validateManagerAssignment(employeeId: UUID, managerId: UUID, organizationId: UUID): Promise<{
    isValid: boolean;
    error?: string;
}>;
/**
 * Gets employee hierarchy depth
 */
export declare function getEmployeeHierarchyDepth(employeeId: UUID): Promise<number>;
/**
 * Formats salary for display
 */
export declare function formatSalary(amount: number, currency?: string): string;
/**
 * Checks if employee is eligible for certain actions based on tenure
 */
export declare function checkTenureEligibility(hireDate: Date, requiredMonths: number): boolean;
/**
 * Gets years of service for an employee
 */
export declare function getYearsOfService(hireDate: Date, terminationDate?: Date): number;
/**
 * Masks sensitive employee data for logging
 */
export declare function maskSensitiveData(employee: any): any;
//# sourceMappingURL=employee.util.d.ts.map