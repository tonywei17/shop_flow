import { NextResponse } from "next/server";
import { generateInvoiceMainPageHTML } from "@/lib/pdf/invoice-html-template";
import { InvoicePDFData } from "@/lib/pdf/invoice-types";

// 模拟数据用于编辑器
const mockData: InvoicePDFData = {
  invoiceNumber: "INV-202511-0001",
  invoiceNo: "0001",
  billingMonth: "2025-11",
  issueDate: "2025-12-18",
  recipient: {
    postalCode: "063-0023",
    address: "北海道札幌市西区平和三条7丁目1-14",
    name: "リトミック研究センター北海道第一支局",
    storeCode: "1110000",
  },
  sender: {
    postalCode: "151-0051",
    address: "東京都渋谷区千駄ヶ谷１丁目３０番８号 ダヴィンチ千駄ヶ谷５階",
    name: "特定非営利活動法人リトミック研究センター",
    phone: "03(5786)0095",
    fax: "03(5786)0096",
    registrationNumber: "T6011005001316",
  },
  amounts: {
    previousBalance: 586198,
    payment: 0,
    remainingBalance: 586198,
    ccMembershipFee: 59040,
    materialDelivery: 21600,
    materialShipping: 0,
    unitPrice: 0,
    other: 2400,
    materialReturn: 15040,
    adjustment: 23100,
    nonTaxable: 0,
    headquartersDeduction: 0,
    bankTransferDeduction: 0,
    subtotal: 631098,
    taxAmount: 6800,
    totalAmount: 637898,
  },
  details: {
    ccMembers: [
      { className: "ベビークラス", count: 10, unitPrice: 550, amount: 5500, deliveryDate: "", invoiceAmount: 5500, deductionAmount: 0 },
    ],
    materials: [
      { date: "2025-11-01", slipNumber: "001", productName: "リトミック教材セット", quantity: 5, unitPrice: 3000, amount: 15000, deliveryDate: "", invoiceAmount: 15000, deductionAmount: 0 },
    ],
    otherExpenses: [
      { description: "イベント参加費", amount: 2400 },
    ],
  },
};

export async function GET() {
  try {
    const invoiceHtml = generateInvoiceMainPageHTML(mockData);
    
    // 提取style和body内容
    const styleMatch = invoiceHtml.match(/<style>([\s\S]*?)<\/style>/);
    const bodyMatch = invoiceHtml.match(/<body>([\s\S]*?)<\/body>/);
    
    const originalStyles = styleMatch ? styleMatch[1] : '';
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    
    const editorHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>請求書テンプレートエディター</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    /* エディター用スタイル */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      background: #1a1a2e;
      min-height: 100vh;
      display: flex;
    }
    
    /* サイドバー */
    .sidebar {
      width: 320px;
      background: #16213e;
      color: #fff;
      padding: 20px;
      overflow-y: auto;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
    }
    
    .sidebar h2 {
      font-size: 18px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }
    
    .sidebar h3 {
      font-size: 14px;
      margin: 15px 0 10px;
      color: #00AC4D;
    }
    
    .control-group {
      margin-bottom: 15px;
    }
    
    .control-group label {
      display: block;
      font-size: 12px;
      color: #aaa;
      margin-bottom: 5px;
    }
    
    .control-group input[type="text"],
    .control-group input[type="number"],
    .control-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #0f3460;
      color: #fff;
      font-size: 14px;
    }
    
    .control-group input[type="range"] {
      width: 100%;
    }
    
    .control-group .value-display {
      font-size: 12px;
      color: #00AC4D;
      text-align: right;
    }
    
    .btn {
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #00AC4D;
      color: #fff;
    }
    
    .btn-primary:hover {
      background: #008f40;
    }
    
    .btn-secondary {
      background: #333;
      color: #fff;
    }
    
    .btn-secondary:hover {
      background: #444;
    }
    
    /* プレビューエリア */
    .preview-area {
      margin-left: 320px;
      padding: 40px;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }
    
    .preview-container {
      transform-origin: top center;
    }
    
    /* 選択可能な要素 */
    .selectable {
      cursor: pointer;
      transition: outline 0.2s;
    }
    
    .selectable:hover {
      outline: 2px dashed #00AC4D !important;
      outline-offset: 2px;
    }
    
    .selectable.selected {
      outline: 2px solid #00AC4D !important;
      outline-offset: 2px;
    }
    
    /* ドラッグ可能な要素 */
    .draggable {
      cursor: move;
    }
    
    .draggable.dragging {
      opacity: 0.5;
    }
    
    /* CSS出力モーダル */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }
    
    .modal.show {
      display: flex;
    }
    
    .modal-content {
      background: #16213e;
      padding: 20px;
      border-radius: 8px;
      width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .modal-content h3 {
      color: #fff;
      margin-bottom: 15px;
    }
    
    .modal-content textarea {
      width: 100%;
      height: 300px;
      background: #0f3460;
      color: #00AC4D;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
    }
    
    /* 元のテンプレートスタイル */
    ${originalStyles}
    
    /* エディター用オーバーライド */
    .page {
      transform: scale(var(--preview-scale, 0.8));
      transform-origin: top center;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>📝 テンプレートエディター</h2>
    
    <h3>📐 プレビュー設定</h3>
    <div class="control-group">
      <label>ズーム</label>
      <input type="range" id="zoom" min="50" max="150" value="80">
      <div class="value-display" id="zoom-value">80%</div>
    </div>
    
    <h3>📄 ページ設定</h3>
    <div class="control-group">
      <label>上パディング (px)</label>
      <input type="number" id="padding-top" value="48" min="0" max="100">
    </div>
    <div class="control-group">
      <label>左右パディング (px)</label>
      <input type="number" id="padding-lr" value="64" min="0" max="100">
    </div>
    
    <h3>🔤 タイトル設定</h3>
    <div class="control-group">
      <label>フォントサイズ (px)</label>
      <input type="number" id="title-size" value="40" min="20" max="60">
    </div>
    <div class="control-group">
      <label>文字間隔 (px)</label>
      <input type="number" id="title-spacing" value="16" min="0" max="30">
    </div>
    
    <h3>💰 金額ボックス設定</h3>
    <div class="control-group">
      <label>ボーダー半径 (px)</label>
      <input type="number" id="box-radius" value="12" min="0" max="30">
    </div>
    <div class="control-group">
      <label>メインカラー</label>
      <input type="text" id="main-color" value="#00AC4D">
    </div>
    
    <h3>📍 選択中の要素</h3>
    <div id="selected-info" style="color: #aaa; font-size: 12px;">
      要素をクリックして選択
    </div>
    
    <div class="control-group" id="position-controls" style="display: none;">
      <label>X位置 (px)</label>
      <input type="number" id="pos-x" value="0">
      <label>Y位置 (px)</label>
      <input type="number" id="pos-y" value="0">
    </div>
    
    <button class="btn btn-primary" onclick="exportCSS()">📋 CSS出力</button>
    <button class="btn btn-secondary" onclick="resetStyles()">🔄 リセット</button>
  </div>
  
  <div class="preview-area">
    <div class="preview-container">
      ${bodyContent}
    </div>
  </div>
  
  <div class="modal" id="css-modal">
    <div class="modal-content">
      <h3>生成されたCSS</h3>
      <textarea id="css-output" readonly></textarea>
      <button class="btn btn-primary" onclick="copyCSS()">📋 コピー</button>
      <button class="btn btn-secondary" onclick="closeModal()">閉じる</button>
    </div>
  </div>
  
  <script>
    // 状態管理
    let selectedElement = null;
    let customStyles = {};
    
    // ズーム制御
    document.getElementById('zoom').addEventListener('input', (e) => {
      const value = e.target.value;
      document.getElementById('zoom-value').textContent = value + '%';
      document.querySelector('.page').style.setProperty('--preview-scale', value / 100);
    });
    
    // パディング制御
    document.getElementById('padding-top').addEventListener('input', (e) => {
      const page = document.querySelector('.page');
      page.style.paddingTop = e.target.value + 'px';
      page.style.paddingBottom = e.target.value + 'px';
      customStyles['page-padding-top'] = e.target.value + 'px';
    });
    
    document.getElementById('padding-lr').addEventListener('input', (e) => {
      const page = document.querySelector('.page');
      page.style.paddingLeft = e.target.value + 'px';
      page.style.paddingRight = e.target.value + 'px';
      customStyles['page-padding-lr'] = e.target.value + 'px';
    });
    
    // タイトル設定
    document.getElementById('title-size').addEventListener('input', (e) => {
      const title = document.querySelector('.title');
      if (title) {
        title.style.fontSize = e.target.value + 'px';
        customStyles['title-font-size'] = e.target.value + 'px';
      }
    });
    
    document.getElementById('title-spacing').addEventListener('input', (e) => {
      const title = document.querySelector('.title');
      if (title) {
        title.style.letterSpacing = e.target.value + 'px';
        customStyles['title-letter-spacing'] = e.target.value + 'px';
      }
    });
    
    // 金額ボックス設定
    document.getElementById('box-radius').addEventListener('input', (e) => {
      const radius = e.target.value + 'px';
      document.querySelectorAll('.price-card-header, .price-card-body, .main-amount-label, .main-amount-value, .total-row').forEach(el => {
        el.style.borderRadius = radius;
      });
      customStyles['box-radius'] = radius;
    });
    
    document.getElementById('main-color').addEventListener('input', (e) => {
      const color = e.target.value;
      document.querySelectorAll('.price-card-header, .price-card-body, .main-amount-label, .main-amount-value, .total-row, .title-bar-top, .title-bar-bottom, .footer-bar').forEach(el => {
        if (el.classList.contains('main-amount-label')) {
          el.style.backgroundColor = color;
        }
        el.style.borderColor = color;
      });
      customStyles['main-color'] = color;
    });
    
    // 要素選択
    document.querySelectorAll('.page *').forEach(el => {
      el.classList.add('selectable');
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedElement) {
          selectedElement.classList.remove('selected');
        }
        selectedElement = el;
        el.classList.add('selected');
        
        const rect = el.getBoundingClientRect();
        const info = document.getElementById('selected-info');
        info.innerHTML = \`
          <strong>\${el.className.split(' ')[0]}</strong><br>
          サイズ: \${Math.round(rect.width)}x\${Math.round(rect.height)}px
        \`;
        
        document.getElementById('position-controls').style.display = 'block';

        // 初期位置をセット
        const posX = document.getElementById('pos-x') as HTMLInputElement;
        const posY = document.getElementById('pos-y') as HTMLInputElement;
        if (!el.dataset.originalTransform) {
          const ct = window.getComputedStyle(el).transform;
          el.dataset.originalTransform = ct === 'none' ? '' : ct;
        }
        if (!el.dataset.offsetX) el.dataset.offsetX = '0';
        if (!el.dataset.offsetY) el.dataset.offsetY = '0';
        posX.value = el.dataset.offsetX;
        posY.value = el.dataset.offsetY;
      });
    });

    // 位置調整
    function updatePosition() {
      if (!selectedElement) return;
      const posX = document.getElementById('pos-x') as HTMLInputElement;
      const posY = document.getElementById('pos-y') as HTMLInputElement;
      const x = parseInt(posX.value || '0', 10);
      const y = parseInt(posY.value || '0', 10);
      selectedElement.dataset.offsetX = String(x);
      selectedElement.dataset.offsetY = String(y);
      const base = selectedElement.dataset.originalTransform || '';
      const translate = \`translate(\${x}px, \${y}px)\`;
      selectedElement.style.transform = base ? \`\${base} \${translate}\` : translate;
      if (window.getComputedStyle(selectedElement).position === 'static') {
        selectedElement.style.position = 'relative';
      }
    }

    document.getElementById('pos-x')?.addEventListener('input', updatePosition);
    document.getElementById('pos-y')?.addEventListener('input', updatePosition);
    
    // CSS出力
    function exportCSS() {
      let css = '/* カスタムスタイル */\\n';
      
      if (customStyles['page-padding-top']) {
        css += \`.page { padding-top: \${customStyles['page-padding-top']}; padding-bottom: \${customStyles['page-padding-top']}; }\\n\`;
      }
      if (customStyles['page-padding-lr']) {
        css += \`.page { padding-left: \${customStyles['page-padding-lr']}; padding-right: \${customStyles['page-padding-lr']}; }\\n\`;
      }
      if (customStyles['title-font-size']) {
        css += \`.title { font-size: \${customStyles['title-font-size']}; }\\n\`;
      }
      if (customStyles['title-letter-spacing']) {
        css += \`.title { letter-spacing: \${customStyles['title-letter-spacing']}; }\\n\`;
      }
      if (customStyles['box-radius']) {
        css += \`.price-card-header, .price-card-body, .main-amount-label, .main-amount-value, .total-row { border-radius: \${customStyles['box-radius']}; }\\n\`;
      }
      if (customStyles['main-color']) {
        css += \`:root { --main-color: \${customStyles['main-color']}; }\\n\`;
      }
      
      document.getElementById('css-output').value = css || '/* 変更なし */';
      document.getElementById('css-modal').classList.add('show');
    }
    
    function copyCSS() {
      const textarea = document.getElementById('css-output');
      textarea.select();
      document.execCommand('copy');
      alert('CSSをコピーしました！');
    }
    
    function closeModal() {
      document.getElementById('css-modal').classList.remove('show');
    }
    
    function resetStyles() {
      location.reload();
    }
    
    // 初期ズーム設定
    document.querySelector('.page').style.setProperty('--preview-scale', 0.8);
  </script>
</body>
</html>
`;
    
    return new NextResponse(editorHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating editor:", error);
    return NextResponse.json(
      { error: "エディター生成エラー" },
      { status: 500 }
    );
  }
}
