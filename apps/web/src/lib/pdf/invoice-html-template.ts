import { InvoicePDFData, CCMemberDetail, MaterialDetail, HEADQUARTERS_INFO, BANK_INFO } from "./invoice-types";

// 格式化金额
function formatCurrency(amount: number): string {
  return `¥${Math.abs(amount).toLocaleString()}`;
}

// 格式化期间
function formatPeriod(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  const endDate = new Date(year, month, 0);
  return `${year}年${month}月1日～${year}年${month}月${endDate.getDate()}日`;
}

// 生成请求书主页HTML
export function generateInvoiceMainPageHTML(data: InvoicePDFData): string {
  const today = new Date();
  const issueDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  
  // 计算其他费用总额
  const otherTotal = data.details.otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご請求書 - ${data.invoiceNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Serif JP', serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 20mm;
      margin: 0 auto;
      background: #fff;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .recipient {
      width: 45%;
    }
    
    .recipient-postal {
      font-size: 9pt;
      margin-bottom: 3px;
    }
    
    .recipient-address {
      font-size: 9pt;
      margin-bottom: 5px;
    }
    
    .recipient-name {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 3px;
    }
    
    .recipient-title {
      font-size: 10pt;
      margin-left: 10px;
    }
    
    .sender {
      width: 50%;
      text-align: right;
    }
    
    .sender-info {
      font-size: 8pt;
      line-height: 1.5;
      text-align: left;
      display: inline-block;
    }
    
    .sender-logo {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 5px;
    }
    
    .sender-logo img {
      height: 40px;
    }
    
    .seal-image {
      width: 50px;
      height: 50px;
    }
    
    .invoice-number {
      font-size: 8pt;
      margin-top: 5px;
    }
    
    .title-section {
      text-align: center;
      margin: 30px 0 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    
    .title {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 15px;
    }
    
    .issue-date {
      text-align: right;
      font-size: 9pt;
      margin-top: 5px;
    }
    
    .greeting {
      font-size: 9pt;
      line-height: 1.8;
      margin: 20px 0;
    }
    
    .amount-box {
      display: flex;
      justify-content: center;
      margin: 25px 0;
    }
    
    .amount-table {
      border: 2px solid #000;
    }
    
    .amount-table td {
      padding: 8px 20px;
      font-size: 14pt;
      font-weight: bold;
    }
    
    .amount-label {
      background: #f0f0f0;
      border-right: 1px solid #000;
    }
    
    .detail-section {
      margin: 30px 0;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    
    .detail-box {
      border: 1px solid #000;
    }
    
    .detail-box-header {
      background: #f5f5f5;
      padding: 5px 10px;
      font-size: 9pt;
      border-bottom: 1px solid #000;
      text-align: center;
    }
    
    .detail-box-content {
      padding: 5px 10px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 9pt;
    }
    
    .detail-row.total {
      border-top: 1px solid #000;
      margin-top: 5px;
      padding-top: 5px;
      font-weight: bold;
    }
    
    .negative {
      color: #c00;
    }
    
    .summary-section {
      margin: 30px 0;
      display: flex;
      justify-content: center;
    }
    
    .summary-table {
      border-collapse: collapse;
      font-size: 10pt;
    }
    
    .summary-table td {
      padding: 5px 15px;
      border: 1px solid #000;
    }
    
    .summary-table .label {
      background: #f5f5f5;
    }
    
    .summary-table .amount {
      text-align: right;
      font-weight: bold;
    }
    
    .notes {
      font-size: 8pt;
      line-height: 1.6;
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #ccc;
      background: #fafafa;
    }
    
    .bank-info {
      font-size: 9pt;
      text-align: center;
      margin-top: 30px;
      padding: 10px;
      border-top: 1px solid #000;
    }
    
    @media print {
      .page {
        margin: 0;
        padding: 15mm 20mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="recipient">
        <div class="recipient-postal">〒${data.recipient.postalCode || ""}</div>
        <div class="recipient-address">${data.recipient.address || ""}</div>
        <div class="recipient-name">
          ${data.recipient.name}
          <span class="recipient-title">御中</span>
        </div>
      </div>
      
      <div class="sender">
        <div class="sender-logo">
          <img src="/images/logo.jpg" alt="ロゴ" style="height: 35px;">
          <img src="/images/seal.jpg" alt="印鑑" class="seal-image">
        </div>
        <div class="sender-info">
          ${HEADQUARTERS_INFO.postalCode}<br>
          ${HEADQUARTERS_INFO.address.replace(/\n/g, '<br>')}<br>
          ${HEADQUARTERS_INFO.name.replace(/\n/g, '<br>')}<br>
          TEL: ${HEADQUARTERS_INFO.phone} / FAX: ${HEADQUARTERS_INFO.fax}<br>
          登録番号: ${HEADQUARTERS_INFO.registrationNumber}
        </div>
        <div class="invoice-number">No. ${data.invoiceNo}</div>
      </div>
    </div>
    
    <div class="title-section">
      <div class="title">ご 請 求 書</div>
      <div class="issue-date">${issueDate}</div>
    </div>
    
    <div class="greeting">
      拝啓　時下ますますご清栄のこととお慶び申し上げます。<br>
      平素は格別のお引き立てを賜り、厚くお礼申し上げます。<br>
      下記の通りご請求申し上げますので、ご確認の上お支払いくださいますようお願い申し上げます。
    </div>
    
    <div class="amount-box">
      <table class="amount-table">
        <tr>
          <td class="amount-label">ご請求金額(税込)</td>
          <td>${formatCurrency(data.amounts.totalAmount)}</td>
        </tr>
      </table>
    </div>
    
    <div class="detail-section">
      <div class="detail-grid">
        <div class="detail-box">
          <div class="detail-box-header">前月繰越残高</div>
          <div class="detail-box-content">
            <div class="detail-row">
              <span>前月請求額</span>
              <span>${formatCurrency(data.amounts.previousBalance)}</span>
            </div>
            <div class="detail-row">
              <span>入金額</span>
              <span>${formatCurrency(data.amounts.payment)}</span>
            </div>
            <div class="detail-row total">
              <span>繰越残高</span>
              <span>${formatCurrency(data.amounts.remainingBalance)}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-box">
          <div class="detail-box-header">ＣＣ会員費(税込)</div>
          <div class="detail-box-content">
            <div class="detail-row">
              <span>当月会員費</span>
              <span>${formatCurrency(data.amounts.ccMembershipFee)}</span>
            </div>
            <div class="detail-row">
              <span>銀行振替分</span>
              <span>${formatCurrency(data.amounts.bankTransferDeduction)}</span>
            </div>
            <div class="detail-row total">
              <span>請求額</span>
              <span>${formatCurrency(data.amounts.ccMembershipFee - data.amounts.bankTransferDeduction)}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-box">
          <div class="detail-box-header">商品購入額(税抜)</div>
          <div class="detail-box-content">
            <div class="detail-row">
              <span>教材費</span>
              <span>${formatCurrency(data.amounts.materialDelivery)}</span>
            </div>
            <div class="detail-row">
              <span>消費税</span>
              <span>${formatCurrency(Math.round(data.amounts.materialDelivery * 0.1))}</span>
            </div>
            <div class="detail-row total">
              <span>税込額</span>
              <span>${formatCurrency(Math.round(data.amounts.materialDelivery * 1.1))}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-grid" style="margin-top: 15px;">
        <div class="detail-box">
          <div class="detail-box-header">その他費用</div>
          <div class="detail-box-content">
            <div class="detail-row">
              <span>その他</span>
              <span class="${otherTotal < 0 ? 'negative' : ''}">${otherTotal < 0 ? '(' + formatCurrency(otherTotal) + ')' : formatCurrency(otherTotal)}</span>
            </div>
          </div>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
    
    <div class="summary-section">
      <table class="summary-table">
        <tr>
          <td class="label">当月ご請求額(税抜) ＝ ①＋②＋③＋④＋⑤＋⑥</td>
          <td class="amount">${formatCurrency(data.amounts.subtotal)}</td>
        </tr>
        <tr>
          <td class="label">消費税額</td>
          <td class="amount">${formatCurrency(data.amounts.taxAmount)}</td>
        </tr>
        <tr>
          <td class="label">ご請求金額(税込)</td>
          <td class="amount">${formatCurrency(data.amounts.totalAmount)}</td>
        </tr>
      </table>
    </div>
    
    <div class="notes">
      ※お支払いは、毎月月末日までに(金融機関休業日の場合は、その前日までに)下記銀行口座にお振込み<br>
      下さいますようお願い申し上げます。
    </div>
    
    <div class="bank-info">
      ${BANK_INFO.bankName} ${BANK_INFO.branchName} ${BANK_INFO.accountType} ${BANK_INFO.accountNumber}　${BANK_INFO.accountHolder}
    </div>
  </div>
</body>
</html>
`;
}

// 生成请求明细书HTML
export function generateInvoiceDetailPageHTML(data: InvoicePDFData, pageNumber: number): string {
  const period = formatPeriod(data.billingMonth);
  
  const ccMemberRows = data.details.ccMembers.map((member: CCMemberDetail, index: number) => `
    <tr>
      <td class="center">${index + 1}</td>
      <td>${member.className}</td>
      <td class="center">人</td>
      <td class="right">${member.count}</td>
      <td class="right">${member.unitPrice.toLocaleString()}</td>
      <td class="right">0.0</td>
      <td class="right">${member.amount.toLocaleString()}</td>
    </tr>
  `).join("");
  
  const ccMemberTotal = data.details.ccMembers.reduce((sum: number, m: CCMemberDetail) => sum + m.amount, 0);
  const ccMemberCount = data.details.ccMembers.reduce((sum: number, m: CCMemberDetail) => sum + m.count, 0);
  
  const materialRows = data.details.materials.map((material: MaterialDetail) => `
    <tr>
      <td class="center">${material.date}</td>
      <td class="center">${material.slipNumber}</td>
      <td>${material.productName}</td>
      <td class="center">個</td>
      <td class="right">${material.quantity}</td>
      <td class="right">${material.unitPrice.toLocaleString()}</td>
      <td class="right">0.0</td>
      <td class="right">${material.amount.toLocaleString()}</td>
    </tr>
  `).join("");
  
  const materialTotal = data.details.materials.reduce((sum: number, m: MaterialDetail) => sum + m.amount, 0);
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ご請求明細書 - ${data.invoiceNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Noto Serif JP', serif;
      font-size: 9pt;
      line-height: 1.3;
      color: #000;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 15mm;
      margin: 0 auto;
      background: #fff;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .header-logo { height: 25px; }
    
    .header-title {
      font-size: 16pt;
      font-weight: bold;
      letter-spacing: 8px;
    }
    
    .header-right {
      text-align: right;
      font-size: 8pt;
    }
    
    .branch-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 8pt;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    
    th, td {
      border: 1px solid #000;
      padding: 2px 4px;
    }
    
    th {
      background: #f5f5f5;
      font-weight: normal;
    }
    
    .center { text-align: center; }
    .right { text-align: right; }
    .left { text-align: left; }
    
    .section-title {
      background: #e0e0e0;
      padding: 3px 8px;
      font-weight: bold;
      border: 1px solid #000;
      border-bottom: none;
    }
    
    .section-subtitle { background: #f0f0f0; }
    
    .total-row {
      background: #f5f5f5;
      font-weight: bold;
    }
    
    .section { margin-bottom: 15px; }
    
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 8pt;
    }
    
    @media print {
      .page {
        margin: 0;
        padding: 10mm 15mm;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <img src="/images/logo.jpg" alt="ロゴ" class="header-logo">
        <span class="header-title">ご 請 求 明 細 書</span>
      </div>
      <div class="header-right">
        <div>${period}</div>
        <div>No. ${data.invoiceNo}</div>
      </div>
    </div>
    
    <div class="branch-info">
      <div>
        <strong>支局コード:</strong> ${data.recipient.storeCode}<br>
        <strong>支局名:</strong> ${data.recipient.name}
      </div>
      <div>
        <strong>発行元:</strong> ${HEADQUARTERS_INFO.name.replace(/\n/g, ' ')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">ＣＣ会員費明細</div>
      <table>
        <thead>
          <tr class="section-subtitle">
            <th style="width: 30px;">No</th>
            <th>クラス名称</th>
            <th style="width: 30px;">単位</th>
            <th style="width: 50px;">数量</th>
            <th style="width: 60px;">単価</th>
            <th style="width: 40px;">税率</th>
            <th style="width: 80px;">金額</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="3" class="left"><strong>前月繰越残高</strong></td>
            <td colspan="4" class="right">${formatCurrency(data.amounts.remainingBalance)}</td>
          </tr>
          <tr>
            <td colspan="3" class="left"><strong>ご入金額</strong></td>
            <td colspan="4" class="right">${formatCurrency(data.amounts.payment)}</td>
          </tr>
          <tr>
            <td colspan="7" class="left"><strong>当月請求分内訳</strong></td>
          </tr>
          ${ccMemberRows}
          <tr class="total-row">
            <td colspan="3" class="center">小計</td>
            <td class="right">${ccMemberCount}</td>
            <td colspan="2"></td>
            <td class="right">${ccMemberTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <div class="section-title">教材費明細</div>
      <table>
        <thead>
          <tr class="section-subtitle">
            <th style="width: 60px;">注文日</th>
            <th style="width: 80px;">伝票番号</th>
            <th>商品名</th>
            <th style="width: 30px;">単位</th>
            <th style="width: 40px;">数量</th>
            <th style="width: 60px;">単価</th>
            <th style="width: 40px;">税率</th>
            <th style="width: 80px;">金額</th>
          </tr>
        </thead>
        <tbody>
          ${materialRows || '<tr><td colspan="8" class="center">該当データなし</td></tr>'}
          <tr class="total-row">
            <td colspan="7" class="center">小計</td>
            <td class="right">${materialTotal.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <table style="width: 50%; margin-left: auto;">
        <tr>
          <td class="left" style="background: #f5f5f5;">ＣＣ会員費 合計</td>
          <td class="right">${formatCurrency(data.amounts.ccMembershipFee)}</td>
        </tr>
        <tr>
          <td class="left" style="background: #f5f5f5;">教材費 合計(税抜)</td>
          <td class="right">${formatCurrency(data.amounts.materialDelivery)}</td>
        </tr>
        <tr>
          <td class="left" style="background: #f5f5f5;">消費税</td>
          <td class="right">${formatCurrency(data.amounts.taxAmount)}</td>
        </tr>
        <tr class="total-row">
          <td class="left">ご請求金額(税込)</td>
          <td class="right">${formatCurrency(data.amounts.totalAmount)}</td>
        </tr>
      </table>
    </div>
    
    <div class="footer">${pageNumber} / 2</div>
  </div>
</body>
</html>
`;
}

// 生成完整的请求书HTML
export function generateFullInvoiceHTML(data: InvoicePDFData): string {
  const mainPageContent = generateInvoiceMainPageHTML(data);
  const detailPageContent = generateInvoiceDetailPageHTML(data, 2);
  
  const extractBodyContent = (html: string): string => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  };
  
  const extractStyleContent = (html: string): string => {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1] : '';
  };
  
  const mainStyle = extractStyleContent(mainPageContent);
  const detailStyle = extractStyleContent(detailPageContent);
  const mainBody = extractBodyContent(mainPageContent);
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
