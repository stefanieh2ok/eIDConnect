import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ndaConfig } from '@/config/nda';

const MARGIN = 50;
const FONT_SIZE = 10;
const LINE_HEIGHT = 14;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const TEXT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

/**
 * Erzeugt ein PDF mit dem NDA-Volltext für DocuSign (oder Download).
 * Gibt den Buffer zurück (für DocuSign als base64 nutzbar).
 */
export async function buildNdaPdfBuffer(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const lines = ndaConfig.fullText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      y -= LINE_HEIGHT * 0.5;
      if (y < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, FONT_SIZE);

      if (width <= TEXT_WIDTH) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          y -= LINE_HEIGHT;
          if (y < MARGIN) {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            y = PAGE_HEIGHT - MARGIN;
          }
          page.drawText(currentLine, {
            x: MARGIN,
            y,
            size: FONT_SIZE,
            font,
            color: rgb(0, 0, 0),
          });
          currentLine = word;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      y -= LINE_HEIGHT;
      if (y < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      page.drawText(currentLine, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
