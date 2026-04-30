import { jsPDF } from "jspdf";
import { getImage } from "./indexeddb";
import type { FlowerRecord } from "../types";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export async function generateAlbumPdf(
  records: FlowerRecord[],
  year: number | null,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const filtered = year
    ? records.filter((r) => r.capturedAt.getFullYear() === year)
    : records;

  const sorted = [...filtered].sort(
    (a, b) => a.capturedAt.getTime() - b.capturedAt.getTime()
  );

  // A4サイズ（mm単位）
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;

  // --- 表紙 ---
  doc.setFillColor(255, 244, 79); // レモンイエロー
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFontSize(36);
  doc.setTextColor(51, 51, 51);
  doc.text("🌻 Flower Shot 🌻", pageW / 2, 100, { align: "center" });

  doc.setFontSize(20);
  const title = year ? `${year} Album` : "All Album";
  doc.text(title, pageW / 2, 130, { align: "center" });

  doc.setFontSize(14);
  doc.text(`${sorted.length} flowers`, pageW / 2, 155, { align: "center" });

  // --- 花のページ（1ページに2枚） ---
  for (let i = 0; i < sorted.length; i++) {
    const record = sorted[i];
    const isTop = i % 2 === 0;

    if (isTop) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");
    }

    const yOffset = isTop ? 10 : pageH / 2 + 5;

    onProgress?.(i + 1, sorted.length);

    // 画像を取得
    const key = record.photoLocalKey || record.id;
    const blob = await getImage(key);

    if (blob) {
      try {
        const dataUrl = await blobToDataUrl(blob);
        const imgW = 80;
        const imgH = 60;
        const imgX = (pageW - imgW) / 2;
        doc.addImage(dataUrl, "JPEG", imgX, yOffset, imgW, imgH);
      } catch {
        // 画像読み込み失敗時はスキップ
      }
    }

    // 花の名前
    doc.setFontSize(16);
    doc.setTextColor(51, 51, 51);
    doc.text(record.flowerName, pageW / 2, yOffset + 70, { align: "center" });

    // 学名
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(record.flowerNameOriginal, pageW / 2, yOffset + 78, { align: "center" });

    // 日付
    doc.setFontSize(10);
    doc.text(formatDate(record.capturedAt), pageW / 2, yOffset + 85, { align: "center" });

    // 信頼度
    const pct = Math.round(record.confidence * 100);
    doc.text(`${pct}%`, pageW / 2, yOffset + 91, { align: "center" });

    // 区切り線（上段のみ）
    if (isTop && i + 1 < sorted.length) {
      doc.setDrawColor(220, 220, 220);
      doc.line(20, pageH / 2, pageW - 20, pageH / 2);
    }
  }

  return doc.output("blob");
}
