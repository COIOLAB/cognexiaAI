export type CsvRow = Record<string, string | undefined>;

const CSV_MIME_TYPES = new Set([
  'application/csv',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
]);

const EXCEL_EPOCH_OFFSET_DAYS = 25569;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const stripByteOrderMark = (value: string) => value.replace(/^\uFEFF/, '');

const normalizeCsvHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const toIsoDateString = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();

export const normalizeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).trim().toLowerCase();
  if (!text) {
    return '';
  }

  if (text.includes('@')) {
    return text.replace(/\s+/g, '');
  }

  return text
    .replace(/['"`]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const createImportedId = (entity: string, index: number): string => {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${entity}-import-${Date.now()}-${index + 1}-${randomPart}`;
};

export const ensureCsvFile = (file: File): void => {
  const fileName = file.name?.toLowerCase() ?? '';
  const fileType = file.type?.toLowerCase() ?? '';

  if (!file.size) {
    throw new Error('The selected CSV file is empty.');
  }

  if (!fileName.endsWith('.csv') && !CSV_MIME_TYPES.has(fileType)) {
    throw new Error('Please select a valid CSV file.');
  }
};

export const parseCsvNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  if (!text) {
    return undefined;
  }

  const isNegative = /^\(.*\)$/.test(text);
  const cleanedValue = text
    .replace(/^\((.*)\)$/, '$1')
    .replace(/[$,%\s,]/g, '');

  if (!cleanedValue) {
    return undefined;
  }

  const parsedNumber = Number(cleanedValue);
  if (Number.isNaN(parsedNumber)) {
    return undefined;
  }

  return isNegative ? -parsedNumber : parsedNumber;
};

export const parseCsvBoolean = (value: unknown): boolean | undefined => {
  const normalizedValue = normalizeCsvValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  if (['true', 'yes', 'y', '1'].includes(normalizedValue)) {
    return true;
  }

  if (['false', 'no', 'n', '0'].includes(normalizedValue)) {
    return false;
  }

  return undefined;
};

export const parseCsvDate = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const text = String(value).trim();
  if (!text) {
    return undefined;
  }

  const excelSerial = Number(text);
  if (!Number.isNaN(excelSerial) && text !== '' && excelSerial > 0) {
    const parsedDate = new Date((excelSerial - EXCEL_EPOCH_OFFSET_DAYS) * MILLISECONDS_PER_DAY);
    if (!Number.isNaN(parsedDate.getTime())) {
      return toIsoDateString(parsedDate);
    }
  }

  const isoDateMatch = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoDateMatch) {
    const [, yearText, monthText, dayText] = isoDateMatch;
    const parsedDate = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  const slashDateMatch = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (slashDateMatch) {
    const [, firstText, secondText, yearText] = slashDateMatch;
    const first = Number(firstText);
    const second = Number(secondText);
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    const parsedDate = new Date(Date.UTC(Number(yearText), month - 1, day));
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  const parsedDate = new Date(text);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
};

export const parseCsvText = (csvText: string): CsvRow[] => {
  const rows: string[][] = [];
  const sanitizedText = stripByteOrderMark(csvText);
  let currentValue = '';
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < sanitizedText.length; index += 1) {
    const character = sanitizedText[index];
    const nextCharacter = sanitizedText[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (character === ',' && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1;
      }

      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += character;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const [headerRow, ...dataRows] = rows.filter((row) =>
    row.some((column) => column.trim().length > 0)
  );

  if (!headerRow || headerRow.length === 0) {
    throw new Error('The CSV file must include a header row.');
  }

  const headers = headerRow.map((header) => normalizeCsvHeader(header));
  if (headers.every((header) => !header)) {
    throw new Error('The CSV file header row is invalid.');
  }

  return dataRows.map((row) => {
    const parsedRow: CsvRow = {};

    headers.forEach((header, index) => {
      if (!header) {
        return;
      }

      const cellValue = row[index]?.trim();
      parsedRow[header] = cellValue ? cellValue : undefined;
    });

    return parsedRow;
  });
};
