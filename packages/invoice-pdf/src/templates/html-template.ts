/**
 * @enterprise/invoice-pdf - HTML Template Generator
 *
 * Generates HTML templates for invoice PDF rendering.
 * Uses Puppeteer for PDF conversion.
 */

import type {
  InvoicePDFData,
  CCMemberDetail,
  MaterialDetail,
  OtherExpenseDetail,
} from "../types";
import { getBankInfo, getAssets } from "../config";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format currency amount with proper styling for negative values
 */
function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `<span class="negative-amount">(¥${Math.abs(amount).toLocaleString()})</span>`;
  }
  return `¥${amount.toLocaleString()}`;
}

/**
 * Format billing period for display
 */
function formatPeriod(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const endDate = new Date(year, month, 0);
  return `${year}年${month}月1日～${year}年${month}月${endDate.getDate()}日`;
}

/**
 * Get logo as Base64 data URL
 */
function getLogoBase64(): string {
  const assets = getAssets();
  return assets?.logo || "";
}

/**
 * Get seal as Base64 data URL
 */
function getSealBase64(): string {
  const assets = getAssets();
  return assets?.seal || "";
}

// =============================================================================
// Main Page Template
// =============================================================================

/**
 * Generate the main invoice page HTML
 */
export function generateInvoiceMainPageHTML(data: InvoicePDFData): string {
  const bankInfo = getBankInfo();
  const today = new Date();
  const issueDate = `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, "0")}月${String(today.getDate()).padStart(2, "0")}日`;

  const otherTotal = data.details.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const ccNetAmount = data.amounts.ccMembershipFee - data.amounts.bankTransferDeduction;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご請求書 - ${data.invoiceNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    ${getMainPageStyles()}
  </style>
</head>
<body>
  <div class="page">
    <div class="page-content">
    <!-- Header -->
    <div class="header">
      <div class="recipient">
        <div class="recipient-address">
          <span class="recipient-address-line">〒${data.recipient.postalCode || "000-0000"}</span>
          <span class="recipient-address-line">${data.recipient.prefecture || ""}${data.recipient.city || ""}${data.recipient.addressLine1 || ""}</span>
          ${data.recipient.addressLine2 ? `<span class="recipient-address-line">${data.recipient.addressLine2}</span>` : ""}
          ${data.recipient.managerName ? `<span class="recipient-address-line">${data.recipient.managerName.split(/\s+/)[0]}様方</span>` : ""}
        </div>
        <div class="recipient-name">
          ${data.recipient.name}様
        </div>
        <div class="recipient-store">
          ${data.recipient.storeCode}
        </div>
      </div>

      <div class="sender">
        <div class="sender-address">
          ${data.sender.postalCode}<br>
          ${data.sender.address.replace(/\n/g, "<br>")}
        </div>
        <div class="sender-content">
          ${getLogoBase64() ? `<img src="${getLogoBase64()}" alt="ロゴ" class="sender-logo">` : ""}
          <div class="sender-info">
            <div class="sender-name">
              ${data.sender.name.replace(/\n/g, "<br>")}
            </div>
            <div class="sender-contact">電話 ${data.sender.phone}　Fax ${data.sender.fax}</div>
            <div class="sender-registration">登録番号「Ｔ${data.sender.registrationNumber.replace(/^T/, "")}」</div>
          </div>
          ${getSealBase64() ? `<img src="${getSealBase64()}" alt="印鑑" class="sender-seal">` : ""}
        </div>
      </div>
    </div>

    <!-- Title Section -->
    <div class="title-section">
      <div class="title-bar-top"></div>
      <div class="title-content">
        <div class="title">ご請求書</div>
        <div class="issue-date">${issueDate}</div>
      </div>
      <div class="title-bar-bottom"></div>
    </div>

    <!-- Greeting -->
    <div class="greeting">
      <div class="greeting-text">
        毎度ありがとうございます。<br>
        当月お取引勘定を、下記の通りご請求申し上げます。<br>
        ご不明の点は、お手数ですが本部事務局宛ご連絡下さい。
      </div>
      <div class="invoice-no">
        No.<span class="invoice-no-value">${data.invoiceNo.split("-").pop() || "0001"}</span>
      </div>
    </div>

    <!-- Main Amount -->
    <div class="main-amount">
      <div class="main-amount-box">
        <div class="main-amount-label">
          <span class="main-amount-label-text">お振込み依頼額</span>
        </div>
        <div class="main-amount-value">
          <span class="main-amount-value-text">${formatCurrency(data.amounts.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Sub Prices -->
    <div class="subprice-section">
      <!-- Left Column -->
      <div class="price-column">
        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">前月ご請求額</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(data.amounts.previousBalance)}</span>
            </div>
          </div>
          <div class="price-number">a</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">ご入金額</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(data.amounts.payment)}</span>
            </div>
          </div>
          <div class="price-number">b</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">ご入金後残額</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(data.amounts.remainingBalance)}</span>
            </div>
          </div>
          <div class="price-number">①=a-b</div>
        </div>
      </div>

      <!-- Middle Column -->
      <div class="price-column">
        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">チャイルドクラブ会費</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(ccNetAmount)}</span>
            </div>
          </div>
          <div class="price-number">②</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">教材お買い上げ</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(data.amounts.materialDelivery)}</span>
            </div>
          </div>
          <div class="price-number">③</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header">
              <span class="price-card-header-text">そ　の　他</span>
            </div>
            <div class="price-card-body">
              <span class="price-card-value">${formatCurrency(otherTotal)}</span>
            </div>
          </div>
          <div class="price-number">④</div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="price-column">
        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header red">
              <span class="price-card-header-text">教材販売割戻し</span>
            </div>
            <div class="price-card-body red">
              <span class="price-card-value">${formatCurrency(data.amounts.materialReturn || 0)}</span>
            </div>
          </div>
          <div class="price-number">⑤</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header red">
              <span class="price-card-header-text">調整・ご返金</span>
            </div>
            <div class="price-card-body red">
              <span class="price-card-value">${formatCurrency(data.amounts.adjustment || 0)}</span>
            </div>
          </div>
          <div class="price-number">⑥</div>
        </div>

        <div class="price-item">
          <div class="price-number"></div>
          <div class="price-card">
            <div class="price-card-header gray">
              <span class="price-card-header-text">非課税分</span>
            </div>
            <div class="price-card-body gray">
              <span class="price-card-value">¥0</span>
            </div>
          </div>
          <div class="price-number">⑦</div>
        </div>
      </div>
    </div>

    <!-- Total Table -->
    <div class="total-section">
      <div class="total-table">
        <div class="total-left">
          <div class="total-row top-left">
            <span class="total-label">差し引き合計額 ⑧ = ① + ② + ③ + ④ + ⑦ - ⑤ - ⑥</span>
          </div>
          <div class="total-row middle-left">
            <span class="total-label">消費税額 ⑨ =（② + ③ + ④ - ⑤）x 10%</span>
          </div>
          <div class="total-row bottom-left">
            <span class="total-label large">ご請求額　⑧ + ⑨</span>
          </div>
        </div>
        <div class="total-right">
          <div class="total-row top-right">
            <span class="total-value">${formatCurrency(data.amounts.subtotal)}</span>
          </div>
          <div class="total-row middle-right">
            <span class="total-value">${formatCurrency(data.amounts.taxAmount)}</span>
          </div>
          <div class="total-row bottom-right">
            <span class="total-value">${formatCurrency(data.amounts.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <div class="payment-text">
        お支払いは、<span class="payment-highlight">当月25日（金融機関休業日の場合は、その前日）まで</span>に、下記銀行口座にお振込み<br>
        下さいますようお願い申し上げます。
      </div>
      <div class="bank-info">
        ${bankInfo.bankName}　${bankInfo.branchName}　（${bankInfo.accountType}）　${bankInfo.accountNumber}　　${bankInfo.accountHolder}
      </div>
    </div>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar"></div>
  </div>
</body>
</html>
`;
}

// =============================================================================
// Detail Page Template
// =============================================================================

/**
 * Generate the invoice detail page HTML
 */
export function generateInvoiceDetailPageHTML(data: InvoicePDFData, showZero = false): string {
  const period = formatPeriod(data.billingMonth);

  const materialTotal = data.details.materials.reduce((sum: number, m: MaterialDetail) => sum + m.amount, 0);
  const otherTotal = data.details.otherExpenses.reduce((sum: number, o: OtherExpenseDetail) => sum + o.amount, 0);

  const maxTableHeight = 730;
  const defaultRowHeight = 28;
  const pages: string[] = [];
  let currentRows: string[] = [];
  let currentHeight = 0;

  const estimateRowHeight = (content: string): number => {
    if (content && content.length > 21) {
      return defaultRowHeight * 2;
    }
    return defaultRowHeight;
  };

  const pushPage = () => {
    const pageHtml = `
    <div class="detail-page">
      <!-- Header -->
      <div class="detail-header">
        <div class="detail-header-top">
          ${getLogoBase64() ? `<img src="${getLogoBase64()}" alt="ロゴ" class="detail-logo">` : '<div class="detail-logo-placeholder"></div>'}
          <div class="detail-title">ご 請 求 明 細 書</div>
        </div>
        <div class="detail-header-bar"></div>
        <div class="detail-period">${period}</div>
      </div>

      <!-- Info Section -->
      <div class="detail-info">
        <div class="detail-info-row">
          <div class="detail-info-left">
            <span class="detail-info-label">お取引コード</span>
            <span class="detail-info-value">${data.recipient.storeCode}</span>
          </div>
          <div class="detail-info-right">
            <span class="detail-info-label" style="width: auto;">No.</span>
            <span class="detail-info-value">${data.invoiceNo}</span>
          </div>
        </div>
        <div class="detail-info-row">
          <div class="detail-info-left">
            <span class="detail-info-label">お取引名</span>
            <span class="detail-info-value">${data.recipient.name}</span>
          </div>
          <div class="detail-sender">
            <div class="detail-sender-org">${data.sender.name.split("\n")[0] || ""}</div>
            <div class="detail-sender-name">${data.sender.name.split("\n")[1] || data.sender.name}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <table class="detail-table">
        <thead>
          <tr>
            <th class="col-date">日付</th>
            <th class="col-slip">伝票番号</th>
            <th class="col-name">品名或者摘要</th>
            <th class="col-code">品番</th>
            <th class="col-qty">数量</th>
            <th class="col-price">単価</th>
            <th class="col-amount">納入额</th>
            <th class="col-dest">納入先</th>
            <th class="col-invoice">ご請求额</th>
            <th class="col-rebate">割戻し额(-)</th>
          </tr>
        </thead>
        <tbody>
          ${currentRows.join("\n")}
        </tbody>
      </table>
      <div class="detail-footer-bar"></div>
    </div>
    `;
    pages.push(pageHtml);
    currentRows = [];
    currentHeight = 0;
  };

  const ensureSpace = (neededHeight: number) => {
    if (currentHeight + neededHeight > maxTableHeight) {
      pushPage();
    }
  };

  const addRow = (rowHtml: string, rowHeight = defaultRowHeight, countInPagination = true) => {
    if (countInPagination) {
      ensureSpace(rowHeight);
      currentHeight += rowHeight;
    }
    currentRows.push(rowHtml);
  };

  // Balance rows
  addRow(`
    <tr class="balance-row">
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell">前月ご請求额</td>
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell right"></td>
      <td class="cell right"></td>
      <td class="cell center"></td>
      <td class="cell right">${formatCurrency(data.amounts.previousBalance)}</td>
      <td class="cell right"></td>
    </tr>
  `);
  addRow(`
    <tr class="balance-row">
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell">ご入金额</td>
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell right"></td>
      <td class="cell right"></td>
      <td class="cell center"></td>
      <td class="cell right">${formatCurrency(data.amounts.payment)}</td>
      <td class="cell right"></td>
    </tr>
  `);
  addRow(`
    <tr class="balance-row">
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell">当月期初残高</td>
      <td class="cell center"></td>
      <td class="cell center"></td>
      <td class="cell right"></td>
      <td class="cell right"></td>
      <td class="cell center"></td>
      <td class="cell right">${formatCurrency(data.amounts.remainingBalance)}</td>
      <td class="cell right"></td>
    </tr>
  `);

  // CC Section
  const ccMemberTotal = data.details.ccMembers.reduce((sum: number, m: CCMemberDetail) => sum + m.amount, 0);
  const ccMemberCount = data.details.ccMembers.reduce((sum: number, m: CCMemberDetail) => sum + m.count, 0);

  const addSectionHeader = (text: string, bg = "#f9f9f9") => {
    addRow(`
      <tr class="section-header-row" style="background:${bg};">
        <td class="cell center" colspan="10" style="text-align: center;">${text}</td>
      </tr>
    `);
  };

  const addSubtotalRow = (
    cells: {
      qty?: string;
      amount?: string;
      invoice?: string;
      rebate?: string;
    },
    bg = "#f5f5f5"
  ) => {
    addRow(`
      <tr class="subtotal-row" style="background:${bg};">
        <td class="cell center"></td>
        <td class="cell center"></td>
        <td class="cell">計</td>
        <td class="cell center"></td>
        <td class="cell center">${cells.qty ?? ""}</td>
        <td class="cell right"></td>
        <td class="cell right">${cells.amount ?? ""}</td>
        <td class="cell center"></td>
        <td class="cell right">${cells.invoice ?? ""}</td>
        <td class="cell right">${cells.rebate ?? ""}</td>
      </tr>
    `);
  };

  addSectionHeader("＊チャイルドクラブ会費＊", "#FFFCF3");
  const aigranRebateTotal = data.details.ccMembers.reduce((sum: number, m: CCMemberDetail) => sum + (m.rebateAmount || 0), 0);
  const ccMembersToDisplay = showZero ? data.details.ccMembers : data.details.ccMembers.filter((m) => m.count > 0);

  ccMembersToDisplay.forEach((m) => {
    const rebateDisplay = m.isAigran && m.rebateAmount > 0 ? formatCurrency(m.rebateAmount) : "";
    const deliveryCode = m.deliveryDate || "";
    const classNameDisplay = m.isBankTransfer ? `${m.className}(口座振替)` : m.className;
    const zeroMemberClass = m.count === 0 ? "cc-zero-member" : "";
    const rowHeight = estimateRowHeight(classNameDisplay);
    addRow(`
      <tr class="detail-row ${zeroMemberClass}">
        <td class="cell center"></td>
        <td class="cell center"></td>
        <td class="cell">${classNameDisplay}</td>
        <td class="cell center"></td>
        <td class="cell center">${m.count}</td>
        <td class="cell right">${formatCurrency(m.unitPrice)}</td>
        <td class="cell right">${formatCurrency(m.amount)}</td>
        <td class="cell center">${deliveryCode}</td>
        <td class="cell right">${formatCurrency(m.amount)}</td>
        <td class="cell right">${rebateDisplay}</td>
      </tr>
    `, rowHeight);
  });
  addSubtotalRow(
    {
      qty: `${ccMemberCount}`,
      amount: formatCurrency(ccMemberTotal),
      invoice: formatCurrency(ccMemberTotal),
      rebate: aigranRebateTotal > 0 ? formatCurrency(aigranRebateTotal) : "",
    },
    "#FFFCF3"
  );

  // Material Section
  addSectionHeader("＊教材お取引＊", "#F2FBF6");
  data.details.materials.forEach((material: MaterialDetail) => {
    const rowHeight = estimateRowHeight(material.productName);
    addRow(`
      <tr class="detail-row">
        <td class="cell center">${material.date}</td>
        <td class="cell center">${material.slipNumber}</td>
        <td class="cell">${material.productName}</td>
        <td class="cell center"></td>
        <td class="cell center">${material.quantity}</td>
        <td class="cell right">${formatCurrency(material.unitPrice)}</td>
        <td class="cell right">${formatCurrency(material.amount)}</td>
        <td class="cell center">${material.deliveryTo}</td>
        <td class="cell right">${material.invoiceAmount > 0 ? formatCurrency(material.invoiceAmount) : ""}</td>
        <td class="cell right">${formatCurrency(material.deductionAmount)}</td>
      </tr>
    `, rowHeight);
  });
  const materialInvoiceTotal = data.details.materials.reduce((sum: number, m: MaterialDetail) => sum + m.invoiceAmount, 0);
  const materialDeductionTotal = data.details.materials.reduce((sum: number, m: MaterialDetail) => sum + m.deductionAmount, 0);
  addSubtotalRow(
    {
      qty: "",
      amount: formatCurrency(materialTotal),
      invoice: formatCurrency(materialInvoiceTotal),
      rebate: formatCurrency(materialDeductionTotal),
    },
    "#F2FBF6"
  );

  // Other Section
  addSectionHeader("＊その他お取引＊", "#FAF6FF");
  data.details.otherExpenses.forEach((item: OtherExpenseDetail) => {
    const rowHeight = estimateRowHeight(item.description);
    addRow(`
      <tr class="detail-row">
        <td class="cell center"></td>
        <td class="cell center"></td>
        <td class="cell">${item.description}</td>
        <td class="cell center"></td>
        <td class="cell center"></td>
        <td class="cell right"></td>
        <td class="cell right">${formatCurrency(item.amount)}</td>
        <td class="cell center"></td>
        <td class="cell right">${formatCurrency(item.amount)}</td>
        <td class="cell right"></td>
      </tr>
    `, rowHeight);
  });
  addSubtotalRow(
    {
      qty: "",
      amount: formatCurrency(otherTotal),
      invoice: formatCurrency(otherTotal),
      rebate: "",
    },
    "#FAF6FF"
  );

  addSectionHeader("＊以下余白＊", "#fff");

  // Fill remaining rows
  const remainingHeight = maxTableHeight - currentHeight;
  const remainingRows = Math.floor(remainingHeight / defaultRowHeight);
  if (remainingRows > 0) {
    for (let i = 0; i < remainingRows; i++) {
      currentRows.push(`
        <tr class="detail-row filler-row" style="height: ${defaultRowHeight}px;">
          <td class="cell center"></td>
          <td class="cell center"></td>
          <td class="cell"></td>
          <td class="cell center"></td>
          <td class="cell center"></td>
          <td class="cell right"></td>
          <td class="cell right"></td>
          <td class="cell center"></td>
          <td class="cell right"></td>
          <td class="cell right"></td>
        </tr>
      `);
    }
  }

  pushPage();

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご請求明細書 - ${data.invoiceNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    ${getDetailPageStyles()}
  </style>
</head>
<body>
  ${pages.join('<div class="page-break"></div>')}
</body>
</html>
`;
}

// =============================================================================
// Full Invoice HTML
// =============================================================================

/**
 * Generate complete invoice HTML (main page + detail page)
 */
export function generateFullInvoiceHTML(data: InvoicePDFData, showZero = false): string {
  const mainPageContent = generateInvoiceMainPageHTML(data);
  const mainStyle = extractStyleContent(mainPageContent);
  const mainBody = extractBodyContent(mainPageContent);

  const detailPageContent = generateInvoiceDetailPageHTML(data, showZero);
  const detailStyle = extractStyleContent(detailPageContent);
  const detailBody = extractBodyContent(detailPageContent);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>請求書 - ${data.invoiceNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');

    @page { size: A4; margin: 0; }
    .page-break { page-break-before: always; }

    ${mainStyle}
    ${detailStyle}
  </style>
</head>
<body>
  ${mainBody}
  <div class="page-break"></div>
  ${detailBody}
</body>
</html>
`;
}

// =============================================================================
// Helper Functions for HTML Extraction
// =============================================================================

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function extractStyleContent(html: string): string {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return styleMatch ? styleMatch[1] : "";
}

// =============================================================================
// Style Definitions
// =============================================================================

function getMainPageStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.5;
      color: #111;
      background: #f5f5f5;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 48px 64px;
      margin: 20px auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,172,77,0.03), 0 4px 12px rgba(0,172,77,0.01);
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }

    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    @media print {
      body {
        background: #fff;
        margin: 0;
        padding: 0;
      }
      .page {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 48px 64px;
        outline: none;
        box-shadow: none;
        border-radius: 0;
        page-break-after: always;
        overflow: hidden;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      gap: 120px;
      position: relative;
    }

    .recipient {
      display: flex;
      flex-direction: column;
      gap: 4px;
      transform: translate(8px, 8px);
      font-family: 'Noto Serif JP', serif;
      max-width: 280px;
    }

    .recipient-address {
      font-size: 14px;
      font-weight: 500;
      color: #111;
      line-height: 1.5;
    }

    .recipient-address-line {
      display: block;
    }

    .recipient-name {
      font-size: 14px;
      font-weight: 500;
      color: #111;
      line-height: 1.3;
      white-space: nowrap;
    }

    .recipient-store {
      font-size: 15px;
      font-weight: 500;
      color: #111;
      text-align: right;
    }

    .sender {
      width: 320px;
      position: relative;
      transform: translate(-30px, 20px);
    }

    .sender-address {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #111;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .sender-content {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      position: relative;
    }

    .sender-logo {
      width: 36px;
      height: 45px;
      object-fit: contain;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .sender-info {
      flex: 1;
    }

    .sender-name {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #111;
      line-height: 1.4;
      margin-bottom: 2px;
      position: relative;
      z-index: 2;
    }

    .sender-contact {
      font-family: 'Noto Serif JP', serif;
      font-size: 14px;
      font-weight: 500;
      color: #111;
      margin-bottom: 2px;
      position: relative;
      z-index: 2;
      white-space: nowrap;
    }

    .sender-registration {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #111;
      position: relative;
      z-index: 2;
      white-space: nowrap;
    }

    .sender-seal {
      width: 90px;
      height: 90px;
      object-fit: contain;
      flex-shrink: 0;
      position: absolute;
      right: 0px;
      top: -35px;
      opacity: 0.95;
      pointer-events: none;
      z-index: 1;
    }

    .title-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 36px;
    }

    .title-bar-top {
      height: 8px;
      background: rgba(0, 172, 75, 0.7);
      width: 100%;
    }

    .title-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 24px;
    }

    .title {
      font-family: 'M PLUS Rounded 1c', sans-serif;
      font-size: 30px;
      font-weight: 500;
      color: #111;
      letter-spacing: 12px;
      line-height: 44px;
    }

    .issue-date {
      font-size: 20px;
      font-weight: 700;
      color: #555;
    }

    .title-bar-bottom {
      height: 8px;
      background: #00AC4B;
      width: 100%;
    }

    .greeting {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }

    .greeting-text {
      font-size: 16px;
      font-weight: 500;
      color: #000;
      line-height: 1.5;
      padding: 0 64px;
      flex: 1;
    }

    .invoice-no {
      font-size: 16px;
      font-weight: 500;
      color: #000;
    }

    .invoice-no-value {
      text-decoration: underline;
    }

    .main-amount {
      display: flex;
      justify-content: center;
      margin-bottom: 36px;
    }

    .main-amount-box {
      display: flex;
    }

    .main-amount-label {
      background: #00AC4D;
      border: 2px solid #00AC4D;
      border-radius: 12px 0 0 12px;
      padding: 16px 16px;
      width: auto;
      height: 64px;
      box-sizing: border-box;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-amount-label-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }

    .main-amount-value {
      background: #fff;
      border: 2px solid #00AC4D;
      border-left: none;
      border-radius: 0 12px 12px 0;
      padding: 16px 10px;
      width: 160px;
      height: 64px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .main-amount-value-text {
      font-size: 24px;
      font-weight: 700;
      color: #000;
    }

    .subprice-section {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 36px;
    }

    .price-column {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 0;
    }

    .price-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      width: 180px;
    }

    .price-number {
      font-size: 11px;
      font-weight: 500;
      color: #000;
      min-width: 10px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      margin-left: 4px;
    }

    .price-card {
      display: flex;
      flex-direction: column;
      min-width: 160px;
      width: 160px;
    }

    .price-card-header {
      height: 24px;
      border: 2px solid #00AC4D;
      border-bottom: none;
      border-radius: 12px 12px 0 0;
      background: rgba(0, 172, 77, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 6px;
      white-space: nowrap;
    }

    .price-card-header.gray {
      border-color: #555;
      background: rgba(85, 85, 85, 0.03);
    }

    .price-card-header.red {
      border-color: #E02020;
      background: rgba(224, 32, 32, 0.03);
    }

    .price-card-header-text {
      font-size: 11px;
      font-weight: 500;
      color: #555;
      white-space: nowrap;
    }

    .price-card-body {
      height: 40px;
      border: 2px solid #00AC4D;
      border-radius: 0 0 12px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
    }

    .price-card-body.gray {
      border-color: #555;
    }

    .price-card-body.red {
      border-color: #E02020;
    }

    .price-card-value {
      font-size: 20px;
      font-weight: 700;
      color: #111;
    }

    .total-section {
      display: flex;
      justify-content: center;
      margin-bottom: 36px;
    }

    .total-table {
      display: flex;
    }

    .total-left {
      display: flex;
      flex-direction: column;
      width: 421px;
    }

    .total-right {
      display: flex;
      flex-direction: column;
      width: 200px;
    }

    .total-row {
      height: 48px;
      border: 2px solid #00AC4D;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
    }

    .total-row.top-left {
      border-bottom: none;
      border-radius: 12px 0 0 0;
    }

    .total-row.top-right {
      border-bottom: none;
      border-left: none;
      border-radius: 0 12px 0 0;
    }

    .total-row.middle-left {
      border-bottom: none;
    }

    .total-row.middle-right {
      border-bottom: none;
      border-left: none;
    }

    .total-row.bottom-left {
      border-radius: 0 0 0 12px;
    }

    .total-row.bottom-right {
      border-left: none;
      border-radius: 0 0 12px 0;
    }

    .total-label {
      font-size: 14px;
      font-weight: 500;
      color: #111;
    }

    .total-label.large {
      font-size: 16px;
    }

    .total-value {
      font-size: 20px;
      font-weight: 700;
      color: #111;
    }

    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 32px;
      margin-bottom: 8px;
      align-items: center;
      text-align: center;
    }

    .payment-text {
      font-size: 14px;
      font-weight: 500;
      color: #000;
      line-height: 1.4;
      white-space: nowrap;
      text-align: center;
    }

    .payment-highlight {
      color: #E02020;
    }

    .bank-info {
      font-size: 14px;
      font-weight: 700;
      color: #000;
      white-space: nowrap;
      text-align: center;
    }

    .footer-bar {
      height: 8px;
      background: #00AC4B;
      width: 100%;
    }
  `;
}

function getDetailPageStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 13px;
      line-height: 1.35;
      color: #111;
      background: #f5f5f5;
    }

    .detail-page {
      width: 210mm;
      height: 297mm;
      padding: 40px 50px;
      margin: 20px auto;
      background: #fff;
      box-shadow: 0 4px 8px rgba(0, 172, 77, 0.03), 0 4px 12px rgba(0, 172, 77, 0.01);
      border-radius: 8px;
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
    }

    @media print {
      .detail-page {
        margin: 0;
        outline: none;
        box-shadow: none;
        border-radius: 0;
      }
    }

    .detail-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 36px;
    }

    .detail-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 24px;
    }

    .detail-logo {
      width: 44px;
      height: 54px;
      object-fit: contain;
    }

    .detail-logo-placeholder {
      width: 44px;
      height: 54px;
    }

    .detail-title {
      font-family: 'M PLUS Rounded 1c', sans-serif;
      font-size: 28px;
      font-weight: 500;
      color: #111;
      letter-spacing: 10px;
    }

    .detail-header-bar {
      height: 8px;
      background: #00AC4B;
      width: 100%;
    }

    .detail-period {
      text-align: right;
      padding: 0 20px;
      font-size: 18px;
      font-weight: 700;
      color: #555;
    }

    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 36px;
    }

    .detail-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-info-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .detail-info-label {
      font-size: 14px;
      font-weight: 500;
      color: #555;
      width: 92px;
    }

    .detail-info-value {
      font-size: 14px;
      font-weight: 700;
      color: #000;
    }

    .detail-info-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-sender {
      text-align: right;
    }

    .detail-sender-org {
      font-size: 13px;
      font-weight: 500;
      color: #555;
    }

    .detail-sender-name {
      font-size: 14px;
      font-weight: 700;
      color: #000;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      flex: 0 0 auto;
    }

    .detail-table th {
      background: #00AC4D;
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      text-align: center;
      padding: 4px 5px;
      white-space: nowrap;
    }

    .detail-table th.col-date { width: 35px; }
    .detail-table th.col-slip { width: 40px; }
    .detail-table th.col-name { min-width: 200px; }
    .detail-table th.col-code { width: 30px; }
    .detail-table th.col-qty { width: 25px; }
    .detail-table th.col-price { width: 45px; }
    .detail-table th.col-amount { width: 55px; }
    .detail-table th.col-dest { width: 30px; }
    .detail-table th.col-invoice { width: 55px; }
    .detail-table th.col-rebate { width: 50px; }

    .detail-table .cell {
      border: 1px solid #eee;
      padding: 4px 5px;
      font-size: 11px;
      font-weight: 500;
      color: #111;
      height: 28px;
      line-height: 20px;
    }

    .detail-table .cell.center { text-align: center; }
    .detail-table .cell.right { text-align: right; }
    .negative-amount { color: #dc2626; }

    .detail-row:nth-child(odd) {
      background: rgba(65, 144, 255, 0.05);
    }

    .section-header-row td {
      background: #f9f9f9;
      font-weight: 700;
      padding: 4px 5px;
      border: 1px solid #eee;
      font-size: 11px;
      height: 28px;
      line-height: 20px;
    }

    .subtotal-row td {
      background: #f5f5f5;
      font-weight: 700;
      padding: 4px 5px;
      border: 1px solid #eee;
      font-size: 11px;
      height: 28px;
      line-height: 20px;
    }

    .balance-row td {
      padding: 4px 5px;
      border: 1px solid #eee;
      font-size: 11px;
      height: 28px;
      line-height: 20px;
    }

    .detail-footer-bar {
      height: 8px;
      background: #00AC4B;
      width: 100%;
      margin-top: 8px;
    }

    .page-break { page-break-before: always; }

    @media print {
      body { background: #fff; }
      .detail-page {
        margin: 0;
        padding: 48px 64px;
        box-shadow: none;
        border-radius: 0;
      }
    }
  `;
}
