import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import { getSupabase, getUserById } from "@/lib/services/database";
import { processDocument } from "@/lib/services/ocr";
import { verifyDocumentAgainstProfile } from "@/lib/services/document-verification";

// POST: Upload a medical document, run OCR, and verify
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["student"]);

        // Parse multipart form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided. Please upload an image (JPEG/PNG)." },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, or WebP image.`,
                },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        // Convert File to Buffer for OCR
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${user.sub}/${uuidv4()}.${fileExt}`;

        const supabase = getSupabase();
        const { error: uploadError } = await supabase.storage
            .from("medical-docs")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase storage upload failed:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload document. Please try again." },
                { status: 500 }
            );
        }

        // Get public/signed URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("medical-docs").getPublicUrl(fileName);

        // Run OCR
        const ocrResult = await processDocument(buffer);

        // Get student profile for verification
        const studentProfile = await getUserById(user.sub);
        let verification = null;

        if (studentProfile) {
            verification = verifyDocumentAgainstProfile(ocrResult, {
                name: studentProfile.name,
            });
        }

        return NextResponse.json({
            documentUrl: publicUrl,
            storagePath: fileName,
            ocr: {
                confidence: ocrResult.confidence,
                extractedFields: {
                    patientName: ocrResult.patientName,
                    hospitalName: ocrResult.hospitalName,
                    doctorName: ocrResult.doctorName,
                    dateFrom: ocrResult.dateFrom,
                    dateTo: ocrResult.dateTo,
                    diagnosis: ocrResult.diagnosis,
                },
            },
            verification: verification
                ? {
                    isVerified: verification.isVerified,
                    confidence: verification.confidence,
                    mismatches: verification.mismatches,
                }
                : null,
        });
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("Upload document error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
