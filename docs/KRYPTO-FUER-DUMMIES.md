# Kryptographie leicht erklärt: Blindensignaturen, Zero-Knowledge & homomorphe Verschlüsselung

Kurze Erklärungen **ohne Formeln**, mit Bildern im Kopf. Warum das für vertrauenswürdige Wahlen und Abstimmungen relevant ist.

---

## 1. Blindensignaturen (Blind Signatures)

### Was ist das?

Stell dir vor: Du willst, dass **jemand etwas unterschreibt**, ohne zu sehen, **was** genau er unterschreibt. Er bestätigt nur: „Das, was du mir in der Hand gehalten hast, ist in Ordnung – hier ist meine Signatur darauf.“ Erst **nach** der Signatur zeigst du den Inhalt – und alle können die Signatur prüfen.

### Beispiel (nicht digital)

- Du steckst ein Blatt Papier in einen **undurchsichtigen Umschlag** mit Sichtfenster nur für eine Nummer.
- Ein Amt prüft: „Diese Nummer ist gültig / berechtigt.“ und **stempelt den Umschlag** (ohne das Blatt zu sehen).
- Du nimmst den Umschlag mit, öffnest ihn woanders: Jetzt hast du ein **gestempeltes Blatt** – das Amt hat nie gesehen, was auf dem Blatt steht, aber der Stempel ist echt.

### In der Digitalwelt

- Du erzeugst deine **Stimme** (z. B. „Ja“ zu Frage 1).
- Du „verhüllst“ sie kryptographisch (machst sie **blind** für die andere Seite).
- Eine **Autorität** (z. B. Wahlleitung) prüft nur: „Diese Person ist wahlberechtigt und hat noch nicht abgestimmt“ – und **signiert die verhüllte Nachricht** (blind).
- Du „entfernen die Hülle“: Du hast eine **echte Signatur auf deiner echten Stimme** – aber die Autorität hat die Stimme **nie gesehen**. Sie hat nur bestätigt: „Eine berechtigte, einmalige Abstimmung.“

### Wofür gut?

- **Anonyme Legitimität:** Deine Stimme ist amtlich anerkannt (signiert), ohne dass jemand sie mit deiner Person verknüpfen kann.
- Passt z. B. zu **Token/Stimmcode**: Die Behörde signiert „diesen anonymen Stimmcode“ als gültig, ohne zu wissen, welche konkrete Stimme später damit abgegeben wird.

---

## 2. Zero-Knowledge-Beweise (Zero-Knowledge Proofs)

### Was ist das?

Du willst **beweisen, dass du etwas weißt** (z. B. ein Passwort, dass du über 18 bist, oder dass eine Zahl in einem bestimmten Bereich liegt) – **ohne** das Geheimnis selbst zu verraten.

### Beispiel (die Höhle)

- Es gibt eine **Höhle mit einer Tür** in der Mitte, die nur mit einem geheimen Wort aufgeht.
- Du kennst das Wort und willst beweisen: „Ich kenne das Wort.“
- Der Prüfer steht **vor** der Höhle und sieht nicht, was innen passiert.
- Du verschwindest in der Höhle und kommst **entweder links oder rechts** wieder raus – je nachdem, welche Seite du nimmst.
- Der Prüfer sagt: „Komm von links raus.“ Wenn du das Wort kennst, schaffst du das immer. Wenn du es **nicht** kennst, schaffst du es nur in 50 % der Fälle.
- Das wiederholt ihr **viele Male** (z. B. 20-mal). Wer das Wort nicht kennt, rät 20-mal richtig – das ist praktisch unmöglich. Du hast also **bewiesen**, dass du das Wort kennst, **ohne es zu sagen**.

### In der Digitalwelt

- Du beweist: „Ich bin wahlberechtigt“ (z. B. Alter, Staatsbürgerschaft), **ohne** Geburtsdatum oder Passnummer zu nennen.
- Oder: „Meine Stimme liegt in diesem erlaubten Bereich“ (z. B. gültige Option), **ohne** die Stimme zu offenbaren.
- Der Prüfer ist am Ende **überzeugt**, dass die Aussage stimmt – hat aber **kein zusätzliches Wissen** über dein Geheimnis (daher „Zero Knowledge“).

### Wofür gut?

- **Datensparsamkeit:** Nur die nötige Aussage („wahlberechtigt“, „noch nicht abgestimmt“) wird bestätigt – keine unnötigen Personendaten.
- **Vertrauen ohne Offenlegung:** Wahlen/Abstimmungen können so gestaltet werden, dass Berechtigung geprüft wird, ohne Identität und Stimme zu verknüpfen.

---

## 3. Homomorphe Verschlüsselung (Homomorphic Encryption)

### Was ist das?

Normalerweise: Wenn Daten **verschlüsselt** sind, kann man damit **nicht rechnen** – man muss erst entschlüsseln.  
Bei **homomorpher** Verschlüsselung kann man **auf den verschlüsselten Daten rechnen**, und das Ergebnis (auch verschlüsselt) ist genau das, was herauskommen würde, wenn man auf den **unverschlüsselten** Daten gerechnet hätte.

### Beispiel (einfach)

- Du hast eine **Schachtel mit Schlüssel**. Drin liegt die Zahl **5** (niemand sieht sie).
- Jemand legt **eine zweite Schachtel** mit der Zahl **3** daneben.
- Es gibt eine **Regel** („homomorphe Operation“): „Schachtel 1 und Schachtel 2 in die große Maschine stecken – heraus kommt eine neue Schachtel.“
- Die große Maschine **öffnet nie** die Schachteln; sie „rechnet“ nur mit dem Inhalt in verschlüsselter Form.
- Heraus kommt eine Schachtel, in der **8** steht (5 + 3). Du öffnest sie – und siehst 8. Die Maschine hat **nie** die 5 oder die 3 gesehen.

### In der Digitalwelt

- **Stimmen** bleiben verschlüsselt auf dem Server.
- Das System kann **zählen** (z. B. wie viele „Ja“, wie viele „Nein“) – **ohne** die einzelnen Stimmen jemals zu entschlüsseln.
- Am Ende gibt es nur das **verschlüsselte Gesamtergebnis**; mit einem gemeinsamen Schlüssel kann das Endergebnis (z. B. 60 % Ja) veröffentlicht werden, ohne dass Einzelstimmen sichtbar werden.

### Wofür gut?

- **Anonyme Auszählung:** Aggregate (Summen, Prozent) können berechnet werden, ohne Einzelstimmen zu enthüllen.
- **Vertrauen:** Selbst der Betreiber des Systems „sieht“ die Stimmen nicht – er führt nur Operationen auf verschlüsselten Daten aus.

---

## Kurz zusammengefasst

| Verfahren | Idee in einem Satz |
|-----------|---------------------|
| **Blindensignatur** | Jemand signiert etwas, ohne den Inhalt zu sehen – später ist die Signatur trotzdem gültig auf dem echten Inhalt. |
| **Zero-Knowledge** | Du beweist, dass eine Aussage stimmt (z. B. „wahlberechtigt“), ohne das Geheimnis zu verraten. |
| **Homomorphe Verschlüsselung** | Man kann auf verschlüsselten Daten rechnen; das Ergebnis ist korrekt, obwohl niemand die Rohdaten sieht. |

Alle drei können in **kryptographischen Wahl- und Abstimmungssystemen** zusammenspielen: Berechtigung prüfen (z. B. eID + Zero-Knowledge), Stimmberechtigung ausstellen (Blindensignatur), Stimmen sammeln und auszählen ohne sie zu entschlüsseln (homomorphe Verschlüsselung oder ähnliche Verfahren).

---

*Hinweis: Diese Beschreibungen sind vereinfacht. In der Praxis kommen genaue Protokolle, Standards und Sicherheitsbeweise dazu.*
