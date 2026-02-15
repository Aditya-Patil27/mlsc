import type { ParsedMedicalDocument } from "./ocr";

// ---------------------------------------------------------------------------
// Document verification result
// ---------------------------------------------------------------------------

export interface DocumentVerificationResult {
    isVerified: boolean;
    confidence: number; // 0-100
    mismatches: DocumentMismatch[];
    extractedFields: {
        patientName: string | null;
        hospitalName: string | null;
        doctorName: string | null;
        dateFrom: string | null;
        dateTo: string | null;
        diagnosis: string | null;
    };
}

export interface DocumentMismatch {
    field: string;
    expected: string;
    found: string | null;
    severity: "low" | "medium" | "high";
}

// ---------------------------------------------------------------------------
// Fuzzy string matching (simple Dice coefficient)
// ---------------------------------------------------------------------------

function bigrams(str: string): Set<string> {
    const s = str.toLowerCase().replace(/\s+/g, "");
    const pairs = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
        pairs.add(s.substring(i, i + 2));
    }
    return pairs;
}

function similarity(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a.toLowerCase() === b.toLowerCase()) return 1;

    const aBigrams = bigrams(a);
    const bBigrams = bigrams(b);
    let intersect = 0;

    Array.from(aBigrams).forEach((pair) => {
        if (bBigrams.has(pair)) intersect++;
    });

    return (2 * intersect) / (aBigrams.size + bBigrams.size);
}

// ---------------------------------------------------------------------------
// Verify extracted document data against a student profile
// ---------------------------------------------------------------------------

interface StudentProfile {
    name: string;
}

export function verifyDocumentAgainstProfile(
    extracted: ParsedMedicalDocument,
    profile: StudentProfile
): DocumentVerificationResult {
    const mismatches: DocumentMismatch[] = [];
    let totalScore = 0;
    let totalChecks = 0;

    // --- Check 1: Patient name matches student name ---
    totalChecks++;
    if (extracted.patientName) {
        const nameScore = similarity(extracted.patientName, profile.name);
        if (nameScore >= 0.6) {
            totalScore += nameScore * 100;
        } else {
            mismatches.push({
                field: "Patient Name",
                expected: profile.name,
                found: extracted.patientName,
                severity: "high",
            });
        }
    } else {
        mismatches.push({
            field: "Patient Name",
            expected: profile.name,
            found: null,
            severity: "medium",
        });
        totalScore += 30; // partial — name not found but document may still be valid
    }

    // --- Check 2: Hospital / issuer present ---
    totalChecks++;
    if (extracted.hospitalName) {
        totalScore += 100; // hospital found
    } else {
        mismatches.push({
            field: "Hospital / Issuer",
            expected: "Any recognized hospital name",
            found: null,
            severity: "medium",
        });
        totalScore += 20;
    }

    // --- Check 3: Dates present ---
    totalChecks++;
    if (extracted.dateFrom) {
        totalScore += 100;
    } else {
        mismatches.push({
            field: "Date",
            expected: "Valid date range",
            found: null,
            severity: "medium",
        });
        totalScore += 10;
    }

    // --- Check 4: Doctor name present ---
    totalChecks++;
    if (extracted.doctorName) {
        totalScore += 100;
    } else {
        mismatches.push({
            field: "Doctor Name",
            expected: "Doctor name (e.g. Dr. XYZ)",
            found: null,
            severity: "low",
        });
        totalScore += 40;
    }

    const confidence = Math.round(totalScore / totalChecks);
    const highSeverityMismatches = mismatches.filter(
        (m) => m.severity === "high"
    ).length;

    return {
        isVerified: confidence >= 50 && highSeverityMismatches === 0,
        confidence,
        mismatches,
        extractedFields: {
            patientName: extracted.patientName,
            hospitalName: extracted.hospitalName,
            doctorName: extracted.doctorName,
            dateFrom: extracted.dateFrom,
            dateTo: extracted.dateTo,
            diagnosis: extracted.diagnosis,
        },
    };
}
