import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import {
  InvoicePDFData,
  HEADQUARTERS_INFO,
  BANK_INFO,
} from "./invoice-types";
import path from "path";

// 获取图片的绝对路径
const getBasePath = () => {
  const cwd = process.cwd();
  // 检查cwd是否以apps/web结尾（turbo运行时）
  if (cwd.endsWith("/apps/web") || cwd.endsWith("\\apps\\web")) {
    return path.join(cwd, "public");
  }
  // 在项目根目录
  return path.join(cwd, "apps", "web", "public");
};

const PUBLIC_PATH = getBasePath();

const getImagePath = (filename: string) => {
  return path.join(PUBLIC_PATH, "images", filename);
};

// 注册Noto Sans JP字体 - 使用TTF格式
Font.register({
  family: "NotoSansJP",
  src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-400-normal.ttf",
});

Font.register({
  family: "NotoSansJPBold",
  src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@latest/japanese-700-normal.ttf",
});

// 图片路径
const SEAL_IMAGE_PATH = getImagePath("seal.jpg");
const LOGO_IMAGE_PATH = getImagePath("logo.jpg");

// 样式定义
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "NotoSansJP",
  },
  // 页眉区域
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  // 左侧 - 請求先
  recipientSection: {
    width: "45%",
  },
  recipientPostalCode: {
    fontSize: 8,
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 9,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  recipientStoreCode: {
    fontSize: 8,
    color: "#666",
  },
  // 右侧 - 請求元
  senderSection: {
    width: "45%",
    alignItems: "flex-end",
  },
  senderInfo: {
    fontSize: 8,
    textAlign: "right",
    marginBottom: 2,
  },
  senderName: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 4,
  },
  registrationNumber: {
    fontSize: 7,
    color: "#666",
    textAlign: "right",
  },
  // 标题区域
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 8,
  },
  issueDate: {
    fontSize: 10,
    marginTop: 8,
  },
  invoiceNo: {
    fontSize: 9,
    marginTop: 4,
  },
  // 问候语
  greeting: {
    fontSize: 9,
    marginBottom: 15,
    lineHeight: 1.5,
  },
  // 请求总额框
  totalAmountBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  totalAmountLabel: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 11,
  },
  totalAmountValue: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 120,
    textAlign: "center",
  },
  // 金额明细表格
  amountTable: {
    marginBottom: 20,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountCell: {
    width: "32%",
    borderWidth: 1,
    borderColor: "#000",
  },
  amountCellLabel: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    fontSize: 8,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  amountCellValue: {
    padding: 6,
    fontSize: 10,
    textAlign: "center",
  },
  amountCellValueRed: {
    padding: 6,
    fontSize: 10,
    textAlign: "center",
    color: "#cc0000",
  },
  // 合计区域
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: -1,
  },
  summaryLabel: {
    flex: 2,
    padding: 6,
    fontSize: 9,
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  summaryValue: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    textAlign: "right",
    fontWeight: "bold",
  },
  // 银行信息
  bankSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
  },
  bankInfo: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  // 明细书样式
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  detailPeriod: {
    fontSize: 9,
  },
  detailNo: {
    fontSize: 9,
  },
  // 明细表格
  detailTable: {
    marginBottom: 15,
  },
  detailTableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#000",
  },
  detailTableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
  },
  detailTableCell: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: "#000",
    textAlign: "center",
  },
  detailTableCellLast: {
    padding: 4,
    fontSize: 7,
    textAlign: "center",
  },
  // 小计行
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
    marginBottom: 15,
  },
  subtotalLabel: {
    fontSize: 9,
    marginRight: 10,
  },
  subtotalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  // 页脚
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
  // Logo图片
  logoImage: {
    width: 50,
    height: 50,
    marginLeft: "auto",
    marginBottom: 5,
  },
  // 印章图片
  sealImage: {
    width: 70,
    height: 70,
    marginLeft: "auto",
    marginBottom: 5,
  },
  // 明细书用的小logo
  logoImageSmall: {
    width: 30,
    height: 30,
  },
  // 明细书用的小印章
  sealImageSmall: {
    width: 40,
    height: 40,
  },
  // Section title
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

// 格式化金额
const formatCurrency = (amount: number): string => {
  if (amount < 0) {
    return `(¥${Math.abs(amount).toLocaleString()})`;
  }
  return `¥${amount.toLocaleString()}`;
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 格式化月份
const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split("-");
  return `${year}年${parseInt(month)}月`;
};

// 第1页 - 请求书主页
const InvoiceMainPage: React.FC<{ data: InvoicePDFData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    {/* 页眉 - 請求先和請求元 */}
    <View style={styles.header}>
      {/* 左侧 - 請求先 */}
      <View style={styles.recipientSection}>
        <Text style={styles.recipientPostalCode}>{data.recipient.postalCode}</Text>
        <Text style={styles.recipientAddress}>{data.recipient.address}</Text>
        <Text style={styles.recipientName}>{data.recipient.name} 様</Text>
        <Text style={styles.recipientStoreCode}>{data.recipient.storeCode}</Text>
      </View>
      
      {/* 右侧 - 請求元 */}
      <View style={styles.senderSection}>
        <Text style={styles.senderInfo}>{data.sender.postalCode}</Text>
        <Text style={styles.senderInfo}>{data.sender.address}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 5 }}>
          {/* @ts-expect-error - react-pdf Image doesn't require alt */}
          <Image src={LOGO_IMAGE_PATH} style={styles.logoImage} alt="" />
          {/* @ts-expect-error - react-pdf Image doesn't require alt */}
          <Image src={SEAL_IMAGE_PATH} style={styles.sealImage} alt="" />
        </View>
        <Text style={styles.senderName}>{data.sender.name}</Text>
        <Text style={styles.senderInfo}>TEL: {data.sender.phone}</Text>
        <Text style={styles.senderInfo}>FAX: {data.sender.fax}</Text>
        <Text style={styles.registrationNumber}>登録番号: {data.sender.registrationNumber}</Text>
      </View>
    </View>

    {/* 标题 */}
    <View style={styles.titleSection}>
      <Text style={styles.title}>ご 請 求 書</Text>
      <Text style={styles.issueDate}>{formatDate(data.issueDate)}</Text>
      <Text style={styles.invoiceNo}>No. {data.invoiceNo}</Text>
    </View>

    {/* 问候语 */}
    <View style={styles.greeting}>
      <Text>拝啓 時下ますますご清祥のこととお慶び申し上げます。</Text>
      <Text>当月お取引額等を、下記の通りご請求申し上げます。</Text>
      <Text>ご不明の点は、お手数ですが下記までお問合せ下さい。</Text>
    </View>

    {/* 请求总额框 */}
    <View style={styles.totalAmountBox}>
      <Text style={styles.totalAmountLabel}>お振込み依頼額</Text>
      <Text style={styles.totalAmountValue}>{formatCurrency(data.amounts.totalAmount)}</Text>
    </View>

    {/* 金额明细表格 - 3x3 */}
    <View style={styles.amountTable}>
      {/* 第1行 */}
      <View style={styles.amountRow}>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>前月請求額 ①</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.previousBalance)}</Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>チャイルドクラブ会費 ③</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.ccMembershipFee)}</Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>教材発送費用</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.materialShipping)}</Text>
        </View>
      </View>
      
      {/* 第2行 */}
      <View style={styles.amountRow}>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>ご入金 ②</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.payment)}</Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>教材お届け分 ④</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.materialDelivery)}</Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>単価×口数</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.unitPrice)}</Text>
        </View>
      </View>
      
      {/* 第3行 */}
      <View style={styles.amountRow}>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>ご入金後残額</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.remainingBalance)}</Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>その他 ⑤</Text>
          <Text style={data.amounts.other < 0 ? styles.amountCellValueRed : styles.amountCellValue}>
            {formatCurrency(data.amounts.other)}
          </Text>
        </View>
        <View style={styles.amountCell}>
          <Text style={styles.amountCellLabel}>本部発分 ⑥</Text>
          <Text style={styles.amountCellValue}>{formatCurrency(data.amounts.headquartersDeduction)}</Text>
        </View>
      </View>
    </View>

    {/* 合计区域 */}
    <View style={styles.summarySection}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>差引き合計額＝①－②＋③＋④＋⑤－⑥－⑦</Text>
        <Text style={styles.summaryValue}>{formatCurrency(data.amounts.subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>消費税額＝（③＋④－⑥）×10%</Text>
        <Text style={styles.summaryValue}>{formatCurrency(data.amounts.taxAmount)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>ご請求額合計</Text>
        <Text style={styles.summaryValue}>{formatCurrency(data.amounts.totalAmount)}</Text>
      </View>
    </View>

    {/* 银行信息 */}
    <View style={styles.bankSection}>
      <Text style={styles.bankTitle}>お振込先</Text>
      <Text style={styles.bankInfo}>
        {BANK_INFO.bankName} {BANK_INFO.branchName} {BANK_INFO.accountType} {BANK_INFO.accountNumber}
      </Text>
      <Text style={styles.bankInfo}>{BANK_INFO.accountHolder}</Text>
    </View>
  </Page>
);

// 第2-3页 - 请求明细书
const InvoiceDetailPage: React.FC<{ data: InvoicePDFData; pageNumber: number }> = ({ data, pageNumber }) => {
  const startMonth = data.billingMonth;
  const [year, month] = startMonth.split("-").map(Number);
  const periodStart = `${year}年${month}月01日`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}年${month}月${lastDay}日`;

  return (
    <Page size="A4" style={styles.page}>
      {/* 页眉 */}
      <View style={styles.detailHeader}>
        {/* @ts-expect-error - react-pdf Image doesn't require alt */}
        <Image src={LOGO_IMAGE_PATH} style={styles.logoImageSmall} alt="" />
        <Text style={styles.detailTitle}>ご 請 求 明 細 書</Text>
        <View>
          <Text style={styles.detailPeriod}>{periodStart}～{periodEnd}</Text>
          <Text style={styles.detailNo}>No. {data.invoiceNo}</Text>
        </View>
      </View>

      {/* 支局信息 */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 8 }}>店舗コード: {data.recipient.storeCode}</Text>
        <Text style={{ fontSize: 9, fontWeight: "bold" }}>{data.recipient.name}</Text>
      </View>

      {/* 前月残高 */}
      <View style={styles.detailTable}>
        <View style={styles.detailTableHeader}>
          <Text style={[styles.detailTableCell, { flex: 2 }]}>項目</Text>
          <Text style={[styles.detailTableCellLast, { flex: 1 }]}>金額</Text>
        </View>
        <View style={styles.detailTableRow}>
          <Text style={[styles.detailTableCell, { flex: 2 }]}>前月ご請求額</Text>
          <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(data.amounts.previousBalance)}</Text>
        </View>
        <View style={styles.detailTableRow}>
          <Text style={[styles.detailTableCell, { flex: 2 }]}>ご入金額</Text>
          <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(data.amounts.payment)}</Text>
        </View>
        <View style={styles.detailTableRow}>
          <Text style={[styles.detailTableCell, { flex: 2 }]}>当月初残高</Text>
          <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(data.amounts.remainingBalance)}</Text>
        </View>
      </View>

      {/* CC会员费明细 */}
      {data.details.ccMembers.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>★チャイルドクラブ会費★</Text>
          <View style={styles.detailTable}>
            <View style={styles.detailTableHeader}>
              <Text style={[styles.detailTableCell, { flex: 3 }]}>教室名</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>口数</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>単価</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>金額</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>納入先</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>ご請求金額</Text>
              <Text style={[styles.detailTableCellLast, { flex: 1 }]}>控除し額</Text>
            </View>
            {data.details.ccMembers.map((member, index) => (
              <View key={index} style={styles.detailTableRow}>
                <Text style={[styles.detailTableCell, { flex: 3, textAlign: "left" }]}>{member.className}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{member.count}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(member.unitPrice)}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(member.amount)}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{member.deliveryDate}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(member.invoiceAmount)}</Text>
                <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(member.deductionAmount)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* 教材明细 */}
      {data.details.materials.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>教材お届け分</Text>
          <View style={styles.detailTable}>
            <View style={styles.detailTableHeader}>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>日付</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>伝票番号</Text>
              <Text style={[styles.detailTableCell, { flex: 3 }]}>品名または摘要</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>単価</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>数量</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>金額</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>納入先</Text>
              <Text style={[styles.detailTableCell, { flex: 1 }]}>ご請求金額</Text>
              <Text style={[styles.detailTableCellLast, { flex: 1 }]}>控除し額</Text>
            </View>
            {data.details.materials.map((material, index) => (
              <View key={index} style={styles.detailTableRow}>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{material.date}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{material.slipNumber}</Text>
                <Text style={[styles.detailTableCell, { flex: 3, textAlign: "left" }]}>{material.productName}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(material.unitPrice)}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{material.quantity}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(material.amount)}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{material.deliveryDate}</Text>
                <Text style={[styles.detailTableCell, { flex: 1 }]}>{formatCurrency(material.invoiceAmount)}</Text>
                <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(material.deductionAmount)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>計</Text>
            <Text style={styles.subtotalValue}>
              {formatCurrency(data.details.materials.reduce((sum, m) => sum + m.invoiceAmount, 0))}
            </Text>
          </View>
        </>
      )}

      {/* 其他费用明细 */}
      {data.details.otherExpenses.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>★その他費用★</Text>
          <View style={styles.detailTable}>
            <View style={styles.detailTableHeader}>
              <Text style={[styles.detailTableCell, { flex: 4 }]}>摘要</Text>
              <Text style={[styles.detailTableCellLast, { flex: 1 }]}>金額</Text>
            </View>
            {data.details.otherExpenses.map((expense, index) => (
              <View key={index} style={styles.detailTableRow}>
                <Text style={[styles.detailTableCell, { flex: 4, textAlign: "left" }]}>{expense.description}</Text>
                <Text style={[styles.detailTableCellLast, { flex: 1 }]}>{formatCurrency(expense.amount)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>計</Text>
            <Text style={styles.subtotalValue}>
              {formatCurrency(data.details.otherExpenses.reduce((sum, e) => sum + e.amount, 0))}
            </Text>
          </View>
        </>
      )}

      {/* 页脚 */}
      <Text style={styles.footer}>
        {HEADQUARTERS_INFO.name.replace("\n", " ")} - {formatMonth(data.billingMonth)}分 請求明細書
      </Text>
    </Page>
  );
};

// 主文档组件
export const InvoicePDFDocument: React.FC<{ data: InvoicePDFData }> = ({ data }) => (
  <Document>
    <InvoiceMainPage data={data} />
    <InvoiceDetailPage data={data} pageNumber={2} />
  </Document>
);

export default InvoicePDFDocument;
