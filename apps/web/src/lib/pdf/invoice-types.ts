// Invoice PDF data types

export interface InvoicePDFData {
  // 基本信息
  invoiceNumber: string;
  invoiceNo: string; // 编号如 0001
  billingMonth: string; // 2025-11
  issueDate: string; // 发行日期 2025-12-01
  
  // 請求先（收件人）- 支局信息
  recipient: {
    postalCode: string;
    address: string;
    // 细分地址字段（用于换行显示）
    prefecture?: string;
    city?: string;
    addressLine1?: string;
    addressLine2?: string;
    name: string;
    storeCode: string;
    managerName?: string; // 責任者名（XX様方）
  };
  
  // 請求元（发件人）- 总部信息
  sender: {
    postalCode: string;
    address: string;
    name: string;
    phone: string;
    fax: string;
    registrationNumber: string; // 登録番号
  };
  
  // 金额汇总
  amounts: {
    previousBalance: number; // 前月請求額 a
    payment: number; // ご入金額 b
    remainingBalance: number; // ご入金後残額 ①=a-b
    ccMembershipFee: number; // チャイルドクラブ会費 ②
    materialDelivery: number; // 教材お買い上げ ③
    materialShipping: number; // 教材発送費用
    unitPrice: number; // 単価×口数
    other: number; // その他 ④
    materialReturn: number; // 教材販売割戻し ⑤
    adjustment: number; // 調整・ご返金 ⑥
    nonTaxable: number; // 非課税分 ⑦
    headquartersDeduction: number; // 本部発分
    bankTransferDeduction: number; // 口座振替分
    subtotal: number; // 差引き合計額 ⑧
    taxAmount: number; // 消費税額 ⑨
    totalAmount: number; // ご請求額合計 ⑧+⑨
  };
  
  // 明细数据
  details: {
    ccMembers: CCMemberDetail[];
    materials: MaterialDetail[];
    otherExpenses: OtherExpenseDetail[];
  };
}

export interface CCMemberDetail {
  className: string; // 教室名
  classroomCode: string; // 教室コード（店番）
  count: number; // 口数
  unitPrice: number; // 単価
  amount: number; // 金額
  deliveryDate: string; // 納入先（店番後三位）
  invoiceAmount: number; // ご請求金額
  deductionAmount: number; // 控除し額
  isAigran: boolean; // アイグラン教室かどうか
  rebateAmount: number; // 割戻し額（アイグラン用：人数×600）
  isBankTransfer: boolean; // 口座振替教室かどうか
}

export interface MaterialDetail {
  date: string; // 日付 (MM/DD格式)
  slipNumber: string; // 伝票番号 (只显示数字部分)
  productName: string; // 品名または摘要
  unitPrice: number; // 単価
  quantity: number; // 数量
  amount: number; // 納入額
  deliveryTo: string; // 納入先 (支局购买"00"，教室购买显示店番后三位)
  invoiceAmount: number; // ご請求額 (只有支局购买才计算)
  deductionAmount: number; // 割戻し額(-) (所有订单都计算返现)
}

export interface OtherExpenseDetail {
  description: string; // 摘要
  amount: number; // 金額
}

// 总部信息常量
export const HEADQUARTERS_INFO = {
  postalCode: "〒151-0051",
  address: "東京都渋谷区千駄ヶ谷1丁目30番8号\nダヴィンチ千駄ヶ谷1階5号室",
  name: "特定非営利活動法人\nリトミック研究センター",
  phone: "03-5411-3815",
  fax: "03-5411-3816",
  registrationNumber: "T6011005001316",
};

// 振込先银行信息
export const BANK_INFO = {
  bankName: "三井住友銀行",
  branchName: "渋谷駅前支店",
  accountType: "普通",
  accountNumber: "0380624",
  accountHolder: "特定非営利活動法人リトミック研究センター",
};
