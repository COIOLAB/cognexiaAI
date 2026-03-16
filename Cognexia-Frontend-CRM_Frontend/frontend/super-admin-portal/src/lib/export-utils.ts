/**
 * Export Utilities for User Data
 * Supports PDF, Excel, Word, CSV formats
 * SaaS-ready with organization filtering
 */

import { format } from 'date-fns';

// Types
export interface UserExportData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  organizationName?: string;
  organizationId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExportOptions {
  organizationName?: string;
  organizationId?: string;
  filterApplied?: {
    search?: string;
    role?: string;
    status?: string;
  };
  totalUsers: number;
  exportedBy?: string;
}

/**
 * Export to CSV format
 */
export async function exportToCSV(
  users: UserExportData[],
  options: ExportOptions
): Promise<void> {
  const { default: Papa } = await import('papaparse');
  
  const csvData = users.map((user) => ({
    'User ID': user.id,
    'First Name': user.firstName,
    'Last Name': user.lastName,
    'Full Name': `${user.firstName} ${user.lastName}`,
    'Email': user.email,
    'Phone': user.phoneNumber || 'N/A',
    'User Type': user.userType,
    'Organization': user.organizationName || 'N/A',
    'Organization ID': user.organizationId || 'N/A',
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
    'Last Login': user.lastLoginAt
      ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss')
      : 'Never',
    'Created At': format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    'Updated At': user.updatedAt
      ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss')
      : 'N/A',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const filename = generateFilename('csv', options);
  downloadBlob(blob, filename);
}

/**
 * Export to Excel format with multiple sheets
 */
export async function exportToExcel(
  users: UserExportData[],
  options: ExportOptions
): Promise<void> {
  const XLSX = await import('xlsx');

  // Summary Sheet
  const summaryData = [
    ['User Export Report'],
    [''],
    ['Export Date:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ['Organization:', options.organizationName || 'All Organizations'],
    ['Total Users:', options.totalUsers],
    ['Exported By:', options.exportedBy || 'Super Admin'],
    [''],
    ['Summary Statistics:'],
    ['Active Users:', users.filter((u) => u.isActive).length],
    ['Inactive Users:', users.filter((u) => !u.isActive).length],
    ['Email Verified:', users.filter((u) => u.isEmailVerified).length],
    [''],
  ];

  // User Details Sheet
  const userDetailsData = users.map((user) => ({
    'User ID': user.id,
    'First Name': user.firstName,
    'Last Name': user.lastName,
    'Email': user.email,
    'Phone': user.phoneNumber || 'N/A',
    'User Type': user.userType,
    'Organization': user.organizationName || 'N/A',
    'Organization ID': user.organizationId || 'N/A',
    'Status': user.isActive ? 'Active' : 'Inactive',
    'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
    'Last Login': user.lastLoginAt
      ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss')
      : 'Never',
    'Created At': format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    'Updated At': user.updatedAt
      ? format(new Date(user.updatedAt), 'yyyy-MM-dd HH:mm:ss')
      : 'N/A',
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add Summary Sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  // Set column widths
  summaryWs['!cols'] = [{ width: 20 }, { width: 30 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Add Users Sheet
  const usersWs = XLSX.utils.json_to_sheet(userDetailsData);
  // Set column widths
  usersWs['!cols'] = [
    { width: 12 }, // User ID
    { width: 15 }, // First Name
    { width: 15 }, // Last Name
    { width: 25 }, // Email
    { width: 15 }, // Phone
    { width: 15 }, // User Type
    { width: 25 }, // Organization
    { width: 12 }, // Org ID
    { width: 10 }, // Status
    { width: 15 }, // Email Verified
    { width: 20 }, // Last Login
    { width: 20 }, // Created At
    { width: 20 }, // Updated At
  ];
  XLSX.utils.book_append_sheet(wb, usersWs, 'Users');

  // Generate file
  const filename = generateFilename('xlsx', options);
  XLSX.writeFile(wb, filename);
}

/**
 * Export to PDF format with formatted tables
 */
export async function exportToPDF(
  users: UserExportData[],
  options: ExportOptions
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF('landscape');

  // Add header
  doc.setFontSize(20);
  doc.text('User Export Report', 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 30);
  doc.text(
    `Organization: ${options.organizationName || 'All Organizations'}`,
    14,
    36
  );
  doc.text(`Total Users: ${options.totalUsers}`, 14, 42);
  doc.text(`Exported By: ${options.exportedBy || 'Super Admin'}`, 14, 48);

  // Add summary statistics
  const activeUsers = users.filter((u) => u.isActive).length;
  const verifiedUsers = users.filter((u) => u.isEmailVerified).length;

  doc.setFontSize(12);
  doc.text('Summary Statistics:', 14, 58);
  doc.setFontSize(10);
  doc.text(`Active Users: ${activeUsers}`, 20, 64);
  doc.text(`Inactive Users: ${options.totalUsers - activeUsers}`, 20, 70);
  doc.text(`Email Verified: ${verifiedUsers}`, 20, 76);

  // Add users table
  const tableData = users.map((user) => [
    `${user.firstName} ${user.lastName}`,
    user.email,
    user.userType,
    user.organizationName || 'N/A',
    user.isActive ? 'Active' : 'Inactive',
    user.isEmailVerified ? 'Yes' : 'No',
    user.lastLoginAt
      ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm')
      : 'Never',
    format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm'),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [
      [
        'Name',
        'Email',
        'Role',
        'Organization',
        'Status',
        'Verified',
        'Last Login',
        'Created',
      ],
    ],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 35 },
      7: { cellWidth: 35 },
    },
    margin: { top: 85 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = generateFilename('pdf', options);
  doc.save(filename);
}

/**
 * Export to Word format with formatted document
 */
export async function exportToWord(
  users: UserExportData[],
  options: ExportOptions
): Promise<void> {
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
    BorderStyle,
  } = await import('docx');

  // Create header paragraphs
  const headerParagraphs = [
    new Paragraph({
      text: 'User Export Report',
      heading: 'Heading1',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Organization: ${options.organizationName || 'All Organizations'}`,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Total Users: ${options.totalUsers}` })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported By: ${options.exportedBy || 'Super Admin'}`,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Summary Statistics',
      heading: 'Heading2',
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Active Users: ${users.filter((u) => u.isActive).length}`,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Inactive Users: ${users.filter((u) => !u.isActive).length}`,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Email Verified: ${users.filter((u) => u.isEmailVerified).length}`,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'User Details',
      heading: 'Heading2',
      spacing: { after: 100 },
    }),
  ];

  // Create table
  const tableRows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Role', bold: true })] })] }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Organization', bold: true })] })],
        }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Created At', bold: true })] })],
        }),
      ],
    }),
    // Data rows
    ...users.map(
      (user) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: `${user.firstName} ${user.lastName}` }),
              ],
            }),
            new TableCell({ children: [new Paragraph({ text: user.email })] }),
            new TableCell({ children: [new Paragraph({ text: user.userType })] }),
            new TableCell({
              children: [new Paragraph({ text: user.organizationName || 'N/A' })],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: user.isActive ? 'Active' : 'Inactive' }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm'),
                }),
              ],
            }),
          ],
        })
    ),
  ];

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        children: [...headerParagraphs, table],
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = generateFilename('docx', options);
  downloadBlob(blob, filename);
}

/**
 * Generate filename based on format and options
 */
function generateFilename(fileFormat: string, options: ExportOptions): string {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const orgName = options.organizationName
    ? `_${options.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}`
    : '_All_Orgs';
  return `Users_Export${orgName}_${timestamp}.${fileFormat}`;
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Fetch all users for export (without pagination)
 */
export async function fetchAllUsersForExport(
  apiClient: any,
  organizationId?: string,
  search?: string
): Promise<UserExportData[]> {
  const params: any = {
    limit: 10000, // Large limit to get all users
    page: 1,
  };

  if (organizationId && organizationId !== 'all') {
    params.organizationId = organizationId;
  }

  if (search) {
    params.search = search;
  }

  const { data } = await apiClient.get('/users', { params });
  const payload = data?.data ?? data;
  const users = payload.users || payload || [];

  return users.map((user: any) => ({
    ...user,
    organizationName: user.organization?.name || user.organizationName,
  }));
}
