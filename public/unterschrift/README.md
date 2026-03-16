# Ordner für deine Unterschrift (Offenlegende Partei)

Lege hier eine **Bilddatei deiner Unterschrift** ab (z. B. PNG mit transparentem Hintergrund), damit sie in der NDA-Druck-/PDF-Ansicht angezeigt wird.

## So geht’s

1. **Bild erstellen:** Unterschrift auf weißem Papier, abfotografieren oder einscannen, Hintergrund transparent machen (z. B. mit GIMP, Photopea oder einem Online-Tool). Oder eine PNG-Datei mit deiner eingescannten Unterschrift speichern.
2. **Datei hier ablegen:** Lege die Datei `unterschrift.png` in diesen Ordner:
   - `public/unterschrift/unterschrift.png`
   - Die Konfiguration in `config/nda.ts` ist bereits auf `'/unterschrift/unterschrift.png'` gesetzt.

Dann wird deine Unterschrift angezeigt:
- **Im DocuSign-NDA:** Das PDF, das zum Unterzeichnen versendet wird, enthält deine Unterschrift bereits (links, „Offenlegende Partei“). Die andere Partei unterschreibt rechts in DocuSign. Beim Ausdruck erscheinen **beide** Unterschriften.
- **Auf der NDA-Webseite:** unter `/legal/demo-nda` und beim Drucken/PDF.

**Hinweis:** Die rechtsverbindliche Signatur der Empfangenden Partei erfolgt über **DocuSign**. Deine Unterschrift (Bild) wird im PDF eingebettet, damit das Dokument mit beiden Unterschriften ausgedruckt werden kann.
