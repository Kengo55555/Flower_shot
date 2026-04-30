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

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 4, height: 3 });
    img.src = dataUrl;
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;

  // --- 表紙 ---
  doc.setFillColor(255, 244, 79);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFontSize(36);
  doc.setTextColor(51, 51, 51);
  doc.text("Flower Shot", pageW / 2, 100, { align: "center" });

  doc.setFontSize(20);
  const title = year ? `${year} Album` : "All Album";
  doc.text(title, pageW / 2, 130, { align: "center" });

  doc.setFontSize(14);
  doc.text(`${sorted.length} flowers`, pageW / 2, 155, { align: "center" });

  // --- 花のページ（1ページに2枚） ---
  const maxImgW = 90;
  const maxImgH = 65;

  for (let i = 0; i < sorted.length; i++) {
    const record = sorted[i];
    const isTop = i % 2 === 0;

    if (isTop) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");
    }

    const slotY = isTop ? 8 : pageH / 2 + 3;

    onProgress?.(i + 1, sorted.length);

    const key = record.photoLocalKey || record.id;
    const blob = await getImage(key);

    let imgEndY = slotY;

    if (blob) {
      try {
        const dataUrl = await blobToDataUrl(blob);
        const size = await getImageSize(dataUrl);
        const ratio = size.width / size.height;

        let imgW = maxImgW;
        let imgH = imgW / ratio;
        if (imgH > maxImgH) {
          imgH = maxImgH;
          imgW = imgH * ratio;
        }

        const imgX = (pageW - imgW) / 2;
        doc.addImage(dataUrl, "JPEG", imgX, slotY, imgW, imgH);
        imgEndY = slotY + imgH + 3;
      } catch {
        imgEndY = slotY + 5;
      }
    } else {
      imgEndY = slotY + 5;
    }

    // 花の名前
    doc.setFontSize(16);
    doc.setTextColor(51, 51, 51);
    doc.text(record.flowerName, pageW / 2, imgEndY + 5, { align: "center" });

    // 学名
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(record.flowerNameOriginal, pageW / 2, imgEndY + 12, { align: "center" });

    // 日付 + 信頼度
    const pct = Math.round(record.confidence * 100);
    doc.text(`${formatDate(record.capturedAt)}  ${pct}%`, pageW / 2, imgEndY + 18, { align: "center" });

    // 区切り線
    if (isTop && i + 1 < sorted.length) {
      doc.setDrawColor(220, 220, 220);
      doc.line(20, pageH / 2, pageW - 20, pageH / 2);
    }
  }

  return doc.output("blob");
}
