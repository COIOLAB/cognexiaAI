import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } from 'docx';
import Papa from 'papaparse';
import { format } from 'date-fns';
import { EnterprisePayment } from '@/types/enterprise-billing';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format date
const formatDate = (date: string): string => {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
};

// PDF Export
export const exportEnterprisePaymentsToPDF = async (
  payments: EnterprisePayment[],
  organizationName: string,
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  // Title
  doc.setFontSize(18);
  doc.text('Enterprise Payments Report', 14, 15);
  
  doc.setFontSize(11);
  doc.text(`Organization: ${organizationName}`, 14, 22);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`, 14, 28);
  doc.text(`Total Payments: ${payments.length}`, 14, 34);
  
  // Calculate summary
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amountDue), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const pendingCount = payments.filter(p => p.approvalStatus === 'pending').length;
  
  doc.text(`Total Amount Due: ${formatCurrency(totalDue)}`, 14, 40);
  doc.text(`Total Amount Paid: ${formatCurrency(totalPaid)}`, 14, 46);
  doc.text(`Pending Approvals: ${pendingCount}`, 14, 52);
  
  // Table data
  const tableData = payments.map((payment) => [
    payment.organization?.name || 'N/A',
    payment.invoiceNumber,
    payment.contractNumber || 'N/A',
    formatDate(payment.invoiceDate),
    formatDate(payment.dueDate),
    formatCurrency(Number(payment.amountDue)),
    formatCurrency(Number(payment.amountPaid)),
    payment.paymentStatus,
    payment.approvalStatus,
    payment.paymentMethod || 'N/A',
  ]);
  
  autoTable(doc, {
    startY: 58,
    head: [[
      'Organization',
      'Invoice #',
      'Contract #',
      'Invoice Date',
      'Due Date',
      'Amount Due',
      'Amount Paid',
      'Payment Status',
      'Approval',
      'Method',
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    );
  }
  
  doc.save(`enterprise-payments-${organizationName}-${Date.now()}.pdf`);
};

// Excel Export
export const exportEnterprisePaymentsToExcel = async (
  payments: EnterprisePayment[],
  organizationName: string,
): Promise<void> => {
  // Summary data
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amountDue), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const pendingCount = payments.filter(p => p.approvalStatus === 'pending').length;
  
  const summaryData = [
    ['Enterprise Payments Report'],
    [`Organization: ${organizationName}`],
    [`Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`],
    [],
    ['Summary'],
    ['Total Payments', payments.length],
    ['Total Amount Due', totalDue],
    ['Total Amount Paid', totalPaid],
    ['Outstanding Balance', totalDue - totalPaid],
    ['Pending Approvals', pendingCount],
    [],
  ];
  
  // Payment details data
  const detailsData = [
    [
      'Organization',
      'Invoice Number',
      'Contract Number',
      'Invoice Date',
      'Due Date',
      'Amount Due',
      'Amount Paid',
      'Outstanding',
      'Currency',
      'Payment Status',
      'Approval Status',
      'Payment Method',
      'Payment Reference',
      'Notes',
      'Created At',
    ],
    ...payments.map((payment) => [
      payment.organization?.name || 'N/A',
      payment.invoiceNumber,
      payment.contractNumber || 'N/A',
      formatDate(payment.invoiceDate),
      formatDate(payment.dueDate),
      Number(payment.amountDue),
      Number(payment.amountPaid),
      Number(payment.amountDue) - Number(payment.amountPaid),
      payment.currency,
      payment.paymentStatus,
      payment.approvalStatus,
      payment.paymentMethod || 'N/A',
      payment.paymentReference || 'N/A',
      payment.notes || 'N/A',
      formatDate(payment.createdAt),
    ]),
  ];
  
  // Create workbook with two sheets
  const wb = XLSX.utils.book_new();
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
  
  // Set column widths
  detailsWs['!cols'] = [
    { wch: 20 }, // Organization
    { wch: 15 }, // Invoice Number
    { wch: 15 }, // Contract Number
    { wch: 12 }, // Invoice Date
    { wch: 12 }, // Due Date
    { wch: 12 }, // Amount Due
    { wch: 12 }, // Amount Paid
    { wch: 12 }, // Outstanding
    { wch: 8 },  // Currency
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Approval Status
    { wch: 15 }, // Payment Method
    { wch: 20 }, // Payment Reference
    { wch: 30 }, // Notes
    { wch: 12 }, // Created At
  ];
  
  XLSX.utils.book_append_sheet(wb, detailsWs, 'Payment Details');
  
  XLSX.writeFile(wb, `enterprise-payments-${organizationName}-${Date.now()}.xlsx`);
};

// Word Export
export const exportEnterprisePaymentsToWord = async (
  payments: EnterprisePayment[],
  organizationName: string,
): Promise<void> => {
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amountDue), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const pendingCount = payments.filter(p => p.approvalStatus === 'pending').length;
  
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Enterprise Payments Report',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Organization: ${organizationName}`,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: `Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: 'Summary',
            heading: 'Heading2',
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: `Total Payments: ${payments.length}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Total Amount Due: ${formatCurrency(totalDue)}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Total Amount Paid: ${formatCurrency(totalPaid)}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Outstanding Balance: ${formatCurrency(totalDue - totalPaid)}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Pending Approvals: ${pendingCount}`,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'Payment Details',
            heading: 'Heading2',
            spacing: { before: 300, after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Organization')] }),
                  new TableCell({ children: [new Paragraph('Invoice #')] }),
                  new TableCell({ children: [new Paragraph('Due Date')] }),
                  new TableCell({ children: [new Paragraph('Amount Due')] }),
                  new TableCell({ children: [new Paragraph('Amount Paid')] }),
                  new TableCell({ children: [new Paragraph('Status')] }),
                  new TableCell({ children: [new Paragraph('Approval')] }),
                ],
              }),
              ...payments.map(
                (payment) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(payment.organization?.name || 'N/A')],
                      }),
                      new TableCell({
                        children: [new Paragraph(payment.invoiceNumber)],
                      }),
                      new TableCell({
                        children: [new Paragraph(formatDate(payment.dueDate))],
                      }),
                      new TableCell({
                        children: [new Paragraph(formatCurrency(Number(payment.amountDue)))],
                      }),
                      new TableCell({
                        children: [new Paragraph(formatCurrency(Number(payment.amountPaid)))],
                      }),
                      new TableCell({
                        children: [new Paragraph(payment.paymentStatus)],
                      }),
                      new TableCell({
                        children: [new Paragraph(payment.approvalStatus)],
                      }),
                    ],
                  }),
              ),
            ],
          }),
        ],
      },
    ],
  });
  
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `enterprise-payments-${organizationName}-${Date.now()}.docx`;
  link.click();
  URL.revokeObjectURL(url);
};

// CSV Export
export const exportEnterprisePaymentsToCSV = async (
  payments: EnterprisePayment[],
  organizationName: string,
): Promise<void> => {
  const csvData = payments.map((payment) => ({
    Organization: payment.organization?.name || 'N/A',
    'Invoice Number': payment.invoiceNumber,
    'Contract Number': payment.contractNumber || 'N/A',
    'Invoice Date': formatDate(payment.invoiceDate),
    'Due Date': formatDate(payment.dueDate),
    'Amount Due': Number(payment.amountDue),
    'Amount Paid': Number(payment.amountPaid),
    'Outstanding Balance': Number(payment.amountDue) - Number(payment.amountPaid),
    Currency: payment.currency,
    'Payment Status': payment.paymentStatus,
    'Approval Status': payment.approvalStatus,
    'Payment Method': payment.paymentMethod || 'N/A',
    'Payment Reference': payment.paymentReference || 'N/A',
    Notes: payment.notes || 'N/A',
    'Created At': formatDate(payment.createdAt),
    'Updated At': formatDate(payment.updatedAt),
  }));
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `enterprise-payments-${organizationName}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
