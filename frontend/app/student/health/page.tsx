"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { BlockchainBadge } from "@/components/shared/blockchain-badge";
import { DocumentUpload, UploadResult } from "@/components/shared/document-upload";
import { mockHealthCredentials } from "@/data/mock/health";
import { cn, delay } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  ShieldQuestion,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Loader2,
  Sparkles,
  ArrowRight,
  Upload,
  FileImage,
  AlertTriangle,
  X,
} from "lucide-react";

type Step = "select" | "upload" | "review-ocr" | "configure" | "generating" | "success";

export default function HealthPage() {
  const [step, setStep] = useState<Step>("select");
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);
  const [claims, setClaims] = useState({
    hasValidCredential: true,
    fromAuthorizedIssuer: true,
    coversDateRange: true,
    isFirstTimeUse: true,
  });
  const [generatedProof, setGeneratedProof] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const credential = mockHealthCredentials.find((c) => c.id === selectedCredential);

  const handleGenerateProof = async () => {
    setStep("generating");

    // Simulate ZK proof generation
    await delay(3000);

    // Generate mock proof
    const proof = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setGeneratedProof(proof);
    setStep("success");
  };

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
    setStep("review-ocr");
  };

  const handleConfirmUpload = () => {
    // After reviewing OCR, go to configure step
    // In a full implementation, this would create the credential via API
    setStep("configure");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-crimson/10">
            <Shield className="w-12 h-12 text-crimson" />
          </div>
        </div>
        <h1 className="font-heading text-3xl text-walnut mb-2">
          Privacy-First Health Verification
        </h1>
        <p className="text-walnut/60 max-w-xl mx-auto">
          Generate Zero-Knowledge proofs to verify your medical credentials
          without revealing sensitive health information
        </p>
      </motion.div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Select Credential */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Upload New Credential Card */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div
                  onClick={() => setStep("upload")}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-crimson/20 group-hover:from-gold/30 group-hover:to-crimson/30 transition-all">
                    <Upload className="w-8 h-8 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-walnut text-lg group-hover:text-gold transition-colors">
                      Upload New Credential
                    </p>
                    <p className="text-sm text-walnut/60">
                      Upload a medical document for OCR verification and create a new credential
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-walnut/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>

            {/* Existing Credentials */}
            <Card variant="certificate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Select Health Credential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockHealthCredentials.map((cred) => (
                  <div
                    key={cred.id}
                    onClick={() => setSelectedCredential(cred.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedCredential === cred.id
                        ? "border-gold bg-gold/5"
                        : "border-walnut/20 hover:border-walnut/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-crimson/10">
                        <Shield className="w-6 h-6 text-crimson" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-heading font-semibold text-walnut">
                            {cred.credentialType === "medical-leave"
                              ? "Medical Leave Credential"
                              : "Vaccination Record"}
                          </p>
                          <Badge variant="verified">Valid</Badge>
                        </div>
                        <p className="text-sm text-walnut/60">
                          {cred.issuer.name} • {new Date(cred.validFrom).toLocaleDateString()} - {new Date(cred.validTo).toLocaleDateString()}
                        </p>
                      </div>
                      <CheckCircle2
                        className={cn(
                          "w-6 h-6 transition-opacity",
                          selectedCredential === cred.id
                            ? "opacity-100 text-gold"
                            : "opacity-0"
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="ceremonial"
                  size="lg"
                  className="w-full"
                  disabled={!selectedCredential}
                  onClick={() => setStep("configure")}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1b: Upload Document */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card variant="certificate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-gold" />
                  Upload Medical Document
                </CardTitle>
                <p className="text-sm text-walnut/60">
                  Upload a medical certificate or doctor&apos;s note. The document
                  will be scanned using OCR to extract and verify key information.
                </p>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  onUploadComplete={handleUploadComplete}
                  onCancel={() => setStep("select")}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1c: Review OCR Results */}
        {step === "review-ocr" && uploadResult && (
          <motion.div
            key="review-ocr"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Verification Status */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {uploadResult.verification?.isVerified ? (
                    <div className="p-3 rounded-full bg-verified/10">
                      <CheckCircle2 className="w-8 h-8 text-verified" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-full bg-pending/10">
                      <AlertTriangle className="w-8 h-8 text-pending" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-heading text-xl text-walnut">
                      {uploadResult.verification?.isVerified
                        ? "Document Verified"
                        : "Review Required"}
                    </h3>
                    <p className="text-sm text-walnut/60">
                      OCR confidence: {uploadResult.ocr.confidence}% •
                      Verification: {uploadResult.verification?.confidence ?? "N/A"}%
                    </p>
                  </div>
                </div>

                {/* Mismatches */}
                {uploadResult.verification?.mismatches &&
                  uploadResult.verification.mismatches.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-walnut/70">
                        Potential issues:
                      </p>
                      {uploadResult.verification.mismatches.map((m, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                            m.severity === "high"
                              ? "bg-rejected/10 text-rejected"
                              : m.severity === "medium"
                                ? "bg-pending/10 text-pending"
                                : "bg-walnut/5 text-walnut/60"
                          )}
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            <strong>{m.field}:</strong>{" "}
                            {m.found ? `Found "${m.found}"` : "Not found"} •
                            Expected: {m.expected}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Extracted Fields */}
            <Card variant="certificate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gold" />
                  Extracted Information
                </CardTitle>
                <p className="text-sm text-walnut/60">
                  Review the data extracted from your document
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {[
                    { label: "Patient Name", value: uploadResult.ocr.extractedFields.patientName },
                    { label: "Hospital / Issuer", value: uploadResult.ocr.extractedFields.hospitalName },
                    { label: "Doctor", value: uploadResult.ocr.extractedFields.doctorName },
                    { label: "Date From", value: uploadResult.ocr.extractedFields.dateFrom },
                    { label: "Date To", value: uploadResult.ocr.extractedFields.dateTo },
                    { label: "Diagnosis", value: uploadResult.ocr.extractedFields.diagnosis },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between p-3 rounded-lg bg-parchment-dark/30"
                    >
                      <span className="text-sm text-walnut/60">{field.label}</span>
                      <span className="text-sm font-medium text-walnut">
                        {field.value || (
                          <span className="italic text-walnut/40">Not detected</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    variant="ceremonial"
                    size="lg"
                    className="w-full"
                    onClick={handleConfirmUpload}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm & Continue
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setUploadResult(null);
                      setStep("upload");
                    }}
                  >
                    Upload Different Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Configure Claims */}
        {step === "configure" && (credential || uploadResult) && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Privacy Comparison */}
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Traditional Way */}
                  <div className="p-4 rounded-lg bg-rejected/5 border border-rejected/20">
                    <div className="flex items-center gap-2 mb-3">
                      <EyeOff className="w-5 h-5 text-rejected" />
                      <p className="font-heading font-semibold text-rejected">Traditional Way</p>
                    </div>
                    <p className="text-sm text-walnut/70 mb-3">
                      Admin sees everything:
                    </p>
                    <ul className="space-y-1 text-sm text-walnut/60">
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3" /> Your diagnosis
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3" /> Hospital name
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3" /> Doctor details
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="w-3 h-3" /> Full medical record
                      </li>
                    </ul>
                  </div>

                  {/* ZK Way */}
                  <div className="p-4 rounded-lg bg-verified/5 border border-verified/20">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-5 h-5 text-verified" />
                      <p className="font-heading font-semibold text-verified">CampusChain Way</p>
                    </div>
                    <p className="text-sm text-walnut/70 mb-3">
                      Admin sees only:
                    </p>
                    <ul className="space-y-1 text-sm text-walnut/60">
                      <li className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-verified" /> Valid: TRUE
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-verified" /> Authorized: TRUE
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-verified" /> Dates covered: TRUE
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-verified" /> First use: TRUE
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Claims to Prove */}
            <Card variant="certificate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldQuestion className="w-5 h-5 text-gold" />
                  Claims to Prove
                </CardTitle>
                <p className="text-sm text-walnut/60">
                  Select what you want to prove without revealing details
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "hasValidCredential", label: "I have a valid medical credential" },
                  { key: "fromAuthorizedIssuer", label: "Issued by an authorized hospital" },
                  {
                    key: "coversDateRange",
                    label: credential
                      ? `Covers ${new Date(credential.validFrom).toLocaleDateString()} - ${new Date(credential.validTo).toLocaleDateString()}`
                      : uploadResult
                        ? `Covers ${uploadResult.ocr.extractedFields.dateFrom || "N/A"} - ${uploadResult.ocr.extractedFields.dateTo || "N/A"}`
                        : "Covers requested date range",
                  },
                  { key: "isFirstTimeUse", label: "First time using this credential" },
                ].map((claim) => (
                  <label
                    key={claim.key}
                    className="flex items-center gap-3 p-3 rounded-lg bg-parchment-dark/30 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={claims[claim.key as keyof typeof claims]}
                      onChange={(e) =>
                        setClaims((prev) => ({
                          ...prev,
                          [claim.key]: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gold text-gold focus:ring-gold"
                    />
                    <span className="text-walnut">{claim.label}</span>
                  </label>
                ))}

                <div className="pt-4 space-y-3">
                  <Button
                    variant="ceremonial"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerateProof}
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Generate Zero-Knowledge Proof
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("select")}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Generating */}
        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card variant="certificate" className="text-center">
              <CardContent className="py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-gold/30 border-t-gold"
                />
                <h2 className="font-heading text-2xl text-walnut mb-2">
                  Generating ZK Proof
                </h2>
                <p className="text-walnut/60 mb-6">
                  Creating cryptographic proof without revealing your data...
                </p>
                <div className="max-w-xs mx-auto space-y-2 text-left text-sm">
                  {[
                    "Hashing credential data...",
                    "Building Merkle tree...",
                    "Generating witness...",
                    "Computing proof...",
                  ].map((stepText, index) => (
                    <motion.div
                      key={stepText}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.7 }}
                      className="flex items-center gap-2 text-walnut/60"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      {stepText}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card variant="certificate" className="text-center">
              <CardContent className="py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <WaxSeal size="lg" variant="verified" text="ZK" />
                </motion.div>

                <h2 className="font-heading text-3xl text-walnut mb-2">
                  Proof Generated!
                </h2>
                <p className="text-walnut/60 mb-6">
                  Your Zero-Knowledge proof is ready to submit
                </p>

                {/* Proof Summary */}
                <div className="max-w-md mx-auto mb-6 p-4 rounded-lg bg-verified/5 border border-verified/20">
                  <p className="text-sm font-medium text-verified mb-2">What this proof verifies:</p>
                  <div className="space-y-1 text-sm text-walnut/70">
                    <p>✓ Valid credential exists</p>
                    <p>✓ From authorized hospital</p>
                    <p>✓ Covers requested dates</p>
                    <p>✓ Never used before</p>
                  </div>
                </div>

                {/* Proof Hash */}
                {generatedProof && (
                  <div className="mb-6">
                    <p className="text-xs text-walnut/50 uppercase tracking-wider mb-2">
                      Proof Hash
                    </p>
                    <div className="p-3 rounded-lg bg-oxford text-electric-cyan font-mono text-xs break-all">
                      {generatedProof}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button variant="ceremonial" size="lg" className="w-full">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Submit Leave Request
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("select");
                      setSelectedCredential(null);
                      setGeneratedProof(null);
                      setUploadResult(null);
                    }}
                  >
                    Generate Another Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
