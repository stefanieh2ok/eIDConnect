import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ndaConfig } from '@/config/nda';

const MARGIN = 50;
const FONT_SIZE = 10;
const LINE_HEIGHT = 14;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const TEXT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

/** Platz für Unterschriftsblock (Höhe in Punkten) */
const SIGNATURE_BLOCK_HEIGHT = 140;

export type BuildNdaPdfResult = {
  buffer: Buffer;
  /** 1-basierte Seitennummer der letzten Seite (für DocuSign SignHere) */
  lastPageNumber: number;
  /** Position für DocuSign SignHere-Tab (Empfangende Partei), Koordinaten von links/unten */
  signHerePosition: { x: number; y: number };
};

/**
 * Erzeugt ein PDF mit dem NDA-Volltext und Unterschriftsblock für DocuSign (oder Download).
 * Deine Unterschrift (Offenlegende Partei) wird als Bild eingebettet, wenn NDA_SIGNATURE_IMAGE_PATH gesetzt ist.
 * Die Empfangende Partei unterschreibt in DocuSign auf der letzten Seite.
 */
export async function buildNdaPdfBuffer(): Promise<Buffer>;
export async function buildNdaPdfBuffer(
  opts: { withSignatureBlock: true }
): Promise<BuildNdaPdfResult>;
export async function buildNdaPdfBuffer(
  opts?: { withSignatureBlock?: boolean }
): Promise<Buffer | BuildNdaPdfResult> {
  const withSignatureBlock = opts?.withSignatureBlock ?? false;

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

  let lastPageNumber = pdfDoc.getPageCount();

  if (withSignatureBlock) {
    if (y < MARGIN + SIGNATURE_BLOCK_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
      lastPageNumber = pdfDoc.getPageCount();
    }
    y -= LINE_HEIGHT;

    const col1X = MARGIN;
    const col2X = PAGE_WIDTH / 2 + 20;
    const lineY = y - 30;
    const lineWidth = PAGE_WIDTH / 2 - MARGIN - 20;
    const labelSize = 9;

    // Linke Spalte: Offenlegende Partei (du)
    page.drawText(ndaConfig.signatureLabelDisclosing, {
      x: col1X,
      y,
      size: labelSize,
      font,
      color: rgb(0, 0, 0),
    });
    const signatureImagePath = ndaConfig.signatureImagePath?.trim();
    if (signatureImagePath) {
      try {
        const publicPath = signatureImagePath.startsWith('/')
          ? signatureImagePath.slice(1)
          : signatureImagePath;
        const filePath = join(process.cwd(), 'public', publicPath);
        if (existsSync(filePath)) {
          const imageBytes = readFileSync(filePath);
          const image = await pdfDoc.embedPng(imageBytes);
          const maxHeight = 72;
          const maxWidth = lineWidth;
          const scale = Math.min(
            1,
            maxHeight / image.height,
            maxWidth / image.width
          );
          const imgW = image.width * scale;
          const imgH = image.height * scale;
          const imgX = col1X + (lineWidth - imgW) / 2;
          const imgY = lineY - imgH;
          page.drawImage(image, {
            x: imgX,
            y: imgY,
            width: imgW,
            height: imgH,
          });
        } else {
          page.drawLine({
            start: { x: col1X, y: lineY },
            end: { x: col1X + lineWidth, y: lineY },
            thickness: 1,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
      } catch {
        page.drawLine({
          start: { x: col1X, y: lineY },
          end: { x: col1X + lineWidth, y: lineY },
          thickness: 1,
          color: rgb(0.3, 0.3, 0.3),
        });
      }
    } else {
      page.drawLine({
        start: { x: col1X, y: lineY },
        end: { x: col1X + lineWidth, y: lineY },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
    page.drawText('Ort, Datum', {
      x: col1X,
      y: lineY - 14,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Rechte Spalte: Empfangende Partei (DocuSign-Signer)
    page.drawText(ndaConfig.signatureLabelReceiving, {
      x: col2X,
      y,
      size: labelSize,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: col2X, y: lineY },
      end: { x: col2X + lineWidth, y: lineY },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText('Ort, Datum', {
      x: col2X,
      y: lineY - 14,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Hinweis: Unterzeichnete NDA per E-Mail zurücksenden (wenn kein DocuSign genutzt wird)
    const returnHint =
      ndaConfig.returnEmailPrimary && ndaConfig.returnEmailSecondary
        ? `Rücksendung unterzeichneter NDA: ${ndaConfig.returnEmailPrimary} oder ${ndaConfig.returnEmailSecondary}`
        : ndaConfig.returnEmailPrimary
          ? `Rücksendung unterzeichneter NDA: ${ndaConfig.returnEmailPrimary}`
          : '';
    if (returnHint) {
      const hintY = lineY - 36;
      page.drawText(returnHint, {
        x: MARGIN,
        y: hintY,
        size: 8,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
    }

    const signHerePosition = { x: Math.round(col2X), y: Math.round(lineY) };
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    return { buffer, lastPageNumber, signHerePosition };
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
