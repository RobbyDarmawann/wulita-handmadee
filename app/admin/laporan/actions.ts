"use server";

import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function getReportData(month: number, year: number) {
  const statusSelesai = ['pesanan selesai', 'selesai'];
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const orders = await prisma.order.findMany({
    where: { status: { in: statusSelesai }, createdAt: { gte: startDate, lt: endDate } },
    include: { items: true, user: { select: { name: true, membership_tier: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const totalIncome = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalTransactions = orders.length;
  const totalItemsSold = orders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);

  const topProducts = await prisma.orderItem.groupBy({
    by: ['productName'],
    where: { order: { status: { in: statusSelesai }, createdAt: { gte: startDate, lt: endDate } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5
  });

  const topCustomersMap = new Map<string, {
    userId: string | null;
    name: string;
    membership_tier: string;
    totalSpent: number;
    totalOrders: number;
  }>();

  orders.forEach((order) => {
    const key = order.userId || `guest-${order.id}`;
    const current = topCustomersMap.get(key) || {
      userId: order.userId,
      name: order.user?.name?.trim() || order.recipientName || 'Tamu',
      membership_tier: order.user?.membership_tier || 'guest',
      totalSpent: 0,
      totalOrders: 0,
    };

    current.totalSpent += order.totalPrice || 0;
    current.totalOrders += 1;
    topCustomersMap.set(key, current);
  });

  const topCustomers = Array.from(topCustomersMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return { orders, totalIncome, totalTransactions, totalItemsSold, topProducts, topCustomers };
}

export async function exportToExcel(month: number, year: number) {
  try {
    const data = await getReportData(month, year);
    const namaBulan = new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Laporan Penjualan");

    workbook.creator = "Wulita Handmade";
    workbook.created = new Date();
    workbook.modified = new Date();

    sheet.views = [{ state: 'frozen', ySplit: 4 }];
    sheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    };

    sheet.columns = [
      { width: 18 },
      { width: 26 },
      { width: 24 },
      { width: 44 },
      { width: 18 },
    ];

    const colors = {
      title: '1F2937',
      subtitle: '6B7280',
      orange: 'D97706',
      green: '059669',
      blue: '2563EB',
      gray: 'E5E7EB',
      border: 'CBD5E1',
      text: '111827',
      white: 'FFFFFF',
    };

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: colors.border } },
      left: { style: 'thin', color: { argb: colors.border } },
      bottom: { style: 'thin', color: { argb: colors.border } },
      right: { style: 'thin', color: { argb: colors.border } },
    };

    const applyRangeStyle = (
      startRow: number,
      endRow: number,
      startCol = 1,
      endCol = 5,
      options: { fill?: string; bold?: boolean; alignment?: ExcelJS.Alignment } = {}
    ) => {
      for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r);
        row.height = row.height || 22;
        for (let c = startCol; c <= endCol; c++) {
          const cell = row.getCell(c);
          cell.border = borderStyle;
          cell.alignment = {
            vertical: 'middle',
            wrapText: true,
            ...(options.alignment || {}),
          };
          if (options.fill) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: options.fill },
            };
          }
          if (options.bold) {
            cell.font = { bold: true, color: { argb: colors.text } };
          }
        }
      }
    };

    const setSectionHeader = (rowNumber: number, title: string, fillColor: string) => {
      sheet.mergeCells(`A${rowNumber}:E${rowNumber}`);
      const cell = sheet.getCell(`A${rowNumber}`);
      cell.value = title;
      cell.font = { bold: true, color: { argb: colors.white }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(rowNumber).height = 22;
      applyRangeStyle(rowNumber, rowNumber, 1, 5);
    };

    const setHeaderRow = (rowNumber: number, labels: string[]) => {
      const row = sheet.getRow(rowNumber);
      row.values = labels;
      row.height = 20;
      row.font = { bold: true };
      for (let i = 1; i <= 5; i++) {
        row.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.gray } };
        row.getCell(i).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
      applyRangeStyle(rowNumber, rowNumber, 1, 5, { bold: true });
    };

    // Header utama
    sheet.mergeCells("A1:E1");
    sheet.getCell("A1").value = "LAPORAN PENJUALAN WULITA HANDMADE";
    sheet.getCell("A1").font = { bold: true, size: 16, color: { argb: colors.title } };
    sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 24;

    sheet.mergeCells("A2:E2");
    sheet.getCell("A2").value = `Periode: ${namaBulan} ${year}  |  Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: colors.subtitle } };
    sheet.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(2).height = 20;

    // Ringkasan
    setSectionHeader(4, "RINGKASAN PEMASUKAN", colors.orange);

    sheet.getCell("A5").value = "Total Pendapatan:";
    sheet.getCell("B5").value = data.totalIncome;
    sheet.getCell("B5").numFmt = '"Rp" #,##0_-';
    
    sheet.getCell("A6").value = "Total Transaksi:";
    sheet.getCell("B6").value = `${data.totalTransactions} Pesanan`;

    sheet.getCell("A7").value = "Total Barang Terjual:";
    sheet.getCell("B7").value = `${data.totalItemsSold} Item`;

    applyRangeStyle(5, 7, 1, 5);
    sheet.getCell("A5").font = { bold: true };
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B5").font = { bold: true, color: { argb: colors.orange } };
    sheet.getCell("B5").alignment = { horizontal: 'right', vertical: 'middle' };

    // Top produk
    setSectionHeader(10, "TOP 5 PRODUK PALING BANYAK DIBELI", colors.green);
    setHeaderRow(11, ["Rank", "Nama Produk", "", "", "Jumlah Terjual"]);
    sheet.mergeCells("B11:D11");

    sheet.getRow(11).getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

    data.topProducts.forEach((p, i) => {
      const rowNum = 12 + i;
      sheet.getCell(`A${rowNum}`).value = `#${i + 1}`;
      sheet.mergeCells(`B${rowNum}:D${rowNum}`);
      sheet.getCell(`B${rowNum}`).value = p.productName;
      sheet.getCell(`E${rowNum}`).value = `${p._sum.quantity} item`;
      sheet.getRow(rowNum).height = 20;
      sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`B${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`E${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    applyRangeStyle(10, 11 + data.topProducts.length);
    data.topProducts.forEach((_, i) => {
      const rowNum = 12 + i;
      sheet.getCell(`A${rowNum}`).font = { bold: true };
      sheet.getCell(`E${rowNum}`).font = { bold: true, color: { argb: colors.green } };
    });

    // Riwayat transaksi
    const transStart = 18;
    setSectionHeader(transStart, "RIWAYAT TRANSAKSI", colors.blue);
    setHeaderRow(transStart + 1, ["ID Pesanan", "Tanggal Transaksi", "Nama Pelanggan", "Rincian Barang", "Pemasukan"]);

    data.orders.forEach((o, i) => {
      const rowNum = transStart + 2 + i;
      const details = o.items.map(it => `${it.quantity}x ${it.productName}`).join(", ");
      sheet.getRow(rowNum).values = [
        `#ORD-${o.id}`,
        o.createdAt.toLocaleDateString('id-ID'),
        o.recipientName,
        details,
        o.totalPrice
      ];
      sheet.getRow(rowNum).height = 24;
      sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`B${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`C${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`D${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      sheet.getCell(`E${rowNum}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`E${rowNum}`).numFmt = '"Rp" #,##0_-';
      sheet.getCell(`A${rowNum}`).font = { bold: true };
      sheet.getCell(`E${rowNum}`).font = { bold: true, color: { argb: colors.blue } };
    });

    applyRangeStyle(transStart, transStart + 1 + data.orders.length);

    // Top pelanggan
    const customerStart = transStart + data.orders.length + 5;
    setSectionHeader(customerStart, "TOP PELANGGAN", colors.orange);
    setHeaderRow(customerStart + 1, ["Rank", "Nama Pelanggan", "Tier", "Total Pesanan", "Total Belanja"]);

    data.topCustomers.forEach((customer, index) => {
      const rowNum = customerStart + 2 + index;
      sheet.getRow(rowNum).values = [
        `#${index + 1}`,
        customer.name,
        customer.membership_tier,
        customer.totalOrders,
        customer.totalSpent,
      ];
      sheet.getRow(rowNum).height = 20;
      sheet.getCell(`A${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`B${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' };
      sheet.getCell(`C${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`D${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getCell(`E${rowNum}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`E${rowNum}`).numFmt = '"Rp" #,##0_-';
      sheet.getCell(`A${rowNum}`).font = { bold: true };
      sheet.getCell(`E${rowNum}`).font = { bold: true, color: { argb: colors.orange } };
    });

    applyRangeStyle(customerStart, customerStart + 1 + data.topCustomers.length);

    sheet.eachRow((row) => {
      row.alignment = { vertical: 'middle' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error("Export Error:", error);
    return null;
  }
}