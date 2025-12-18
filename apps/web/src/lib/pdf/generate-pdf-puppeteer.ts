import puppeteer from "puppeteer";
import { InvoicePDFData } from "./invoice-types";
import { generateFullInvoiceHTML } from "./invoice-html-template";

// 使用Puppeteer将HTML转换为PDF
export async function generateInvoicePDFFromHTML(data: InvoicePDFData): Promise<Buffer> {
  const html = generateFullInvoiceHTML(data);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置HTML内容
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });
    
    // 等待字体加载
    await page.evaluateHandle("document.fonts.ready");
    
    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// 批量生成PDF
export async function generateMultipleInvoicePDFs(
  dataList: InvoicePDFData[]
): Promise<Map<string, Buffer>> {
  const results = new Map<string, Buffer>();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  
  try {
    for (const data of dataList) {
      const html = generateFullInvoiceHTML(data);
      const page = await browser.newPage();
      
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });
      
      await page.evaluateHandle("document.fonts.ready");
      
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });
      
      results.set(data.invoiceNo, Buffer.from(pdfBuffer));
      await page.close();
    }
    
    return results;
  } finally {
    await browser.close();
  }
}
