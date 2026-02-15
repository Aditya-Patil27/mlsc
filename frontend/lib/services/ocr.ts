import Tesseract from "tesseract.js";

// ---------------------------------------------------------------------------
// Parsed medical document fields
// ---------------------------------------------------------------------------

export interface ParsedMedicalDocument {
    patientName: string | null;
    hospitalName: string | null;
    doctorName: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    diagnosis: string | null;
    rawText: string;
    confidence: number; // 0-100 overall OCR confidence
}

// ---------------------------------------------------------------------------
// OCR — extract text from an image buffer using Tesseract.js
// ---------------------------------------------------------------------------

export async function extractTextFromImage(
    imageBuffer: Buffer
): Promise<{ text: string; confidence: number }> {
    const {
        data: { text, confidence },
    } = await Tesseract.recognize(imageBuffer, "eng", {
        logger: () => { }, // silence logs
    });

    return { text: text.trim(), confidence: Math.round(confidence) };
}

// ---------------------------------------------------------------------------
// Parse extracted text into structured fields via regex heuristics
// ---------------------------------------------------------------------------

const DATE_REGEX =
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi;

const HOSPITAL_KEYWORDS = [
    "hospital",
    "medical center",
    "clinic",
    "health center",
    "healthcare",
    "medical college",
    "nursing home",
    "dispensary",
];

const DOCTOR_REGEX = /(?:Dr\.?\s*|Doctor\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;

const NAME_LABEL_REGEX =
    /(?:patient(?:\s*name)?|name\s*of\s*(?:the\s*)?patient|Mr\.?|Mrs\.?|Ms\.?)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;

export function parseExtractedFields(rawText: string): Omit<ParsedMedicalDocument, "confidence"> {
    // --- Dates ---
    const dateMatches = rawText.match(DATE_REGEX) || [];
    const dateFrom = dateMatches[0] || null;
    const dateTo = dateMatches[1] || dateMatches[0] || null;

    // --- Hospital name ---
    let hospitalName: string | null = null;
    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        const lower = line.toLowerCase();
        if (HOSPITAL_KEYWORDS.some((kw) => lower.includes(kw))) {
            hospitalName = line;
            break;
        }
    }

    // --- Doctor name ---
    let doctorName: string | null = null;
    const drMatch = DOCTOR_REGEX.exec(rawText);
    if (drMatch) {
        doctorName = `Dr. ${drMatch[1]}`;
    }

    // --- Patient name ---
    let patientName: string | null = null;
    const nameMatch = NAME_LABEL_REGEX.exec(rawText);
    if (nameMatch) {
        patientName = nameMatch[1];
    }

    // --- Diagnosis (best effort: look for keywords) ---
    let diagnosis: string | null = null;
    const diagnosisRegex =
        /(?:diagnosis|condition|complaint|ailment|illness)\s*[:\-]?\s*(.+)/i;
    const diagMatch = diagnosisRegex.exec(rawText);
    if (diagMatch) {
        diagnosis = diagMatch[1].trim();
    }

    return {
        patientName,
        hospitalName,
        doctorName,
        dateFrom,
        dateTo,
        diagnosis,
        rawText,
    };
}

// ---------------------------------------------------------------------------
// High-level: run OCR + parse in one call
// ---------------------------------------------------------------------------

export async function processDocument(
    imageBuffer: Buffer
): Promise<ParsedMedicalDocument> {
    const { text, confidence } = await extractTextFromImage(imageBuffer);
    const fields = parseExtractedFields(text);
    return { ...fields, confidence };
}
