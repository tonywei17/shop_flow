import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let cachedSheetsClient: sheets_v4.Sheets | null = null;

function getServiceAccountConfig() {
  const email = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL or GOOGLE_SHEETS_SERVICE_ACCOUNT_PRIVATE_KEY",
    );
  }

  const key = rawKey.replace(/\\n/g, "\n");

  return { email, key };
}

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (cachedSheetsClient) return cachedSheetsClient;

  const { email, key } = getServiceAccountConfig();

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });

  await auth.authorize();

  cachedSheetsClient = google.sheets({ version: "v4", auth });
  return cachedSheetsClient;
}

export type ExportRow = (string | number | null | undefined)[];

export async function exportToSheet(
  spreadsheetId: string | undefined,
  sheetName: string | undefined,
  header: (string | number)[],
  rows: ExportRow[],
): Promise<void> {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID is not configured");
  }

  if (!sheetName) {
    throw new Error("Sheet name is not configured");
  }

  const sheets = await getSheetsClient();

  const values: (string | number)[][] = [
    header,
    ...rows.map((row) => row.map((cell) => (cell ?? "") as string | number)),
  ];

  const range = sheetName;

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });
}
