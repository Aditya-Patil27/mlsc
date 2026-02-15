"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Upload,
    FileImage,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OCRResult {
    confidence: number;
    extractedFields: {
        patientName: string | null;
        hospitalName: string | null;
        doctorName: string | null;
        dateFrom: string | null;
        dateTo: string | null;
        diagnosis: string | null;
    };
}

export interface VerificationResult {
    isVerified: boolean;
    confidence: number;
    mismatches: {
        field: string;
        expected: string;
        found: string | null;
        severity: "low" | "medium" | "high";
    }[];
}

export interface UploadResult {
    documentUrl: string;
    storagePath: string;
    ocr: OCRResult;
    verification: VerificationResult | null;
}

interface DocumentUploadProps {
    onUploadComplete: (result: UploadResult) => void;
    onCancel: () => void;
    className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentUpload({
    onUploadComplete,
    onCancel,
    className,
}: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((selectedFile: File) => {
        setError(null);

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Please upload a JPEG, PNG, or WebP image.");
            return;
        }

        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > MAX_SIZE) {
            setError("File too large. Maximum size is 10MB.");
            return;
        }

        setFile(selectedFile);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleFile(droppedFile);
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Simulate progress steps
            setUploadProgress(20);

            const formData = new FormData();
            formData.append("file", file);

            setUploadProgress(40);

            const response = await fetch("/api/health/upload-document", {
                method: "POST",
                body: formData,
            });

            setUploadProgress(70);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            setUploadProgress(90);

            const result: UploadResult = await response.json();

            setUploadProgress(100);

            // Brief delay to show 100%
            await new Promise((r) => setTimeout(r, 500));

            onUploadComplete(result);
        } catch (err: any) {
            setError(err.message || "Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop zone */}
            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
                            isDragging
                                ? "border-gold bg-gold/10 scale-[1.02]"
                                : "border-walnut/30 hover:border-gold/60 hover:bg-gold/5"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                            }}
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className={cn(
                                    "p-4 rounded-full transition-colors",
                                    isDragging ? "bg-gold/20" : "bg-crimson/10"
                                )}
                            >
                                <Upload
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        isDragging ? "text-gold" : "text-crimson"
                                    )}
                                />
                            </div>
                            <div>
                                <p className="font-heading font-semibold text-walnut">
                                    {isDragging
                                        ? "Drop your document here"
                                        : "Upload Medical Document"}
                                </p>
                                <p className="text-sm text-walnut/60 mt-1">
                                    Drag & drop or click to browse • JPEG, PNG, WebP • Max 10MB
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative rounded-xl border-2 border-gold/40 bg-gold/5 overflow-hidden"
                    >
                        {/* Preview header */}
                        <div className="flex items-center justify-between p-3 border-b border-gold/20">
                            <div className="flex items-center gap-2">
                                <FileImage className="w-5 h-5 text-gold" />
                                <span className="text-sm font-medium text-walnut truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <span className="text-xs text-walnut/50">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                            </div>
                            {!isUploading && (
                                <button
                                    onClick={clearFile}
                                    className="p-1 rounded-full hover:bg-walnut/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-walnut/60" />
                                </button>
                            )}
                        </div>

                        {/* Image preview */}
                        {preview && (
                            <div className="relative w-full h-48 bg-walnut/5">
                                <img
                                    src={preview}
                                    alt="Document preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-parchment/80 to-transparent" />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-walnut/60">
                                    <Eye className="w-3 h-3" />
                                    Preview
                                </div>
                            </div>
                        )}

                        {/* Upload progress */}
                        {isUploading && (
                            <div className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                                    <span className="text-sm text-walnut/70">
                                        {uploadProgress < 40
                                            ? "Uploading document..."
                                            : uploadProgress < 70
                                                ? "Running OCR analysis..."
                                                : uploadProgress < 90
                                                    ? "Verifying document..."
                                                    : "Finalizing..."}
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-walnut/10 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-gold to-crimson"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-rejected/10 border border-rejected/20"
                >
                    <AlertTriangle className="w-4 h-4 text-rejected flex-shrink-0" />
                    <p className="text-sm text-rejected">{error}</p>
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={isUploading}
                >
                    Cancel
                </Button>
                <Button
                    variant="ceremonial"
                    className="flex-1"
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Verify
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
