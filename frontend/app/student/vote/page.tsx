"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { WaxSeal, WaxSealPress } from "@/components/shared/wax-seal";
import { BlockchainBadge } from "@/components/shared/blockchain-badge";
import { mockElections, mockVoterEligibility } from "@/data/mock/voting";
import { cn, delay } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Vote,
  CheckCircle2,
  Users,
  Clock,
  Trophy,
  Flame,
  AlertCircle,
  Loader2,
} from "lucide-react";

type VoteStep = "select" | "confirm" | "voting" | "success";

export default function VotePage() {
  const [step, setStep] = useState<VoteStep>("select");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const election = mockElections[0];
  const eligibility = mockVoterEligibility;
  const totalVotes = election.candidates.reduce((sum, c) => sum + c.voteCount, 0);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setStep("voting");

    // Simulate blockchain transaction
    await delay(2500);

    // Generate mock transaction hash
    const hash = "ALGO_VOTE_" + Math.random().toString(36).substr(2, 40).toUpperCase();
    setTxHash(hash);
    setStep("success");

    // Celebration!
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#6366F1", "#3B82F6", "#10B981"],
    });
  };

  const selectedCandidateData = election.candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="certificate">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-full bg-gold/20">
                <Vote className="w-10 h-10 text-gold" />
              </div>
              <div className="flex-1">
                <Badge variant="verified" className="mb-2">Active Election</Badge>
                <h1 className="font-heading text-2xl text-walnut">{election.title}</h1>
                <p className="text-walnut/60">{election.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-walnut/60">Ends in</p>
                <p className="font-heading text-2xl text-crimson">2 days</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-walnut/10">
              <div className="text-center">
                <p className="text-2xl font-heading text-walnut">{totalVotes}</p>
                <p className="text-sm text-walnut/60">Votes Cast</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-heading text-walnut">{election.eligibleVoterCount}</p>
                <p className="text-sm text-walnut/60">Eligible Voters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-heading text-verified">
                  {((totalVotes / election.eligibleVoterCount) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-walnut/60">Turnout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Eligibility Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          variant="elevated"
          className={cn(
            "border-2",
            eligibility.isEligible ? "border-verified/30" : "border-rejected/30"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-full",
                eligibility.isEligible ? "bg-verified/20" : "bg-rejected/20"
              )}>
                {eligibility.isEligible ? (
                  <CheckCircle2 className="w-6 h-6 text-verified" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rejected" />
                )}
              </div>
              <div>
                <p className={cn(
                  "font-medium",
                  eligibility.isEligible ? "text-verified" : "text-rejected"
                )}>
                  {eligibility.isEligible ? "You are eligible to vote" : "Not eligible"}
                </p>
                <p className="text-sm text-walnut/60">
                  {eligibility.hasVoted
                    ? "You have already voted in this election"
                    : eligibility.isEligible
                    ? `Vote token: ${eligibility.voteToken}`
                    : eligibility.reason}
                </p>
              </div>
              {!eligibility.hasVoted && eligibility.isEligible && (
                <Badge variant="pending" className="ml-auto">
                  <Flame className="w-3 h-3 mr-1" />
                  Token will be burned
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Candidate */}
        {(step === "select" || step === "confirm") && (
          <motion.div
            key="candidates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="font-heading text-xl text-walnut">Choose Your Candidate</h2>

            {election.candidates.map((candidate, index) => {
              const percentage = (candidate.voteCount / totalVotes) * 100;
              const isLeading = candidate.voteCount === Math.max(...election.candidates.map(c => c.voteCount));

              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="elevated"
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      selectedCandidate === candidate.id
                        ? "border-gold shadow-lg"
                        : "border-transparent hover:border-walnut/20"
                    )}
                    onClick={() => {
                      setSelectedCandidate(candidate.id);
                      setStep("select");
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar placeholder */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/30 to-electric-cyan/30 flex items-center justify-center">
                          <span className="font-heading text-2xl text-walnut">
                            {candidate.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading text-xl text-walnut">
                              {candidate.name}
                            </h3>
                            {isLeading && (
                              <Badge variant="gold">
                                <Trophy className="w-3 h-3 mr-1" />
                                Leading
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-walnut/60 mb-3">
                            {candidate.manifesto}
                          </p>

                          {/* Vote bar */}
                          <div className="flex items-center gap-3">
                            <Progress
                              value={percentage}
                              className="h-2 flex-1"
                              indicatorClassName={cn(
                                isLeading ? "bg-gold" : "bg-walnut/30"
                              )}
                            />
                            <span className="text-sm font-mono text-walnut/60 w-20 text-right">
                              {candidate.voteCount} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedCandidate === candidate.id
                            ? "border-gold bg-gold"
                            : "border-walnut/30"
                        )}>
                          {selectedCandidate === candidate.id && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Vote Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ceremonial"
                size="xl"
                className="w-full"
                disabled={!selectedCandidate}
                onClick={() => setStep("confirm")}
              >
                <Vote className="w-5 h-5 mr-2" />
                Cast Your Vote
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        {step === "confirm" && selectedCandidateData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setStep("select")}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card variant="certificate" className="max-w-md">
                <CardContent className="p-8 text-center">
                  <WaxSeal size="lg" variant="star" className="mx-auto mb-4" />
                  <h2 className="font-heading text-2xl text-walnut mb-2">
                    Confirm Your Vote
                  </h2>
                  <p className="text-walnut/60 mb-6">
                    You are about to vote for:
                  </p>
                  <div className="p-4 rounded-lg bg-gold/10 border border-gold/30 mb-6">
                    <p className="font-heading text-xl text-gold">
                      {selectedCandidateData.name}
                    </p>
                  </div>
                  <p className="text-sm text-walnut/50 mb-6">
                    This action cannot be undone. Your vote token will be burned.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setStep("select")}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ceremonial"
                      className="flex-1"
                      onClick={handleVote}
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      Confirm Vote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Voting in Progress */}
        {step === "voting" && (
          <motion.div
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="certificate" className="text-center">
              <CardContent className="py-12">
                <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-6" />
                <h2 className="font-heading text-2xl text-walnut mb-2">
                  Recording Your Vote
                </h2>
                <p className="text-walnut/60">
                  Burning vote token and recording on blockchain...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Success */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="certificate" className="text-center">
              <CardContent className="py-8">
                <WaxSealPress size="lg" variant="verified" />
                <h2 className="font-heading text-3xl text-walnut mb-2 mt-6">
                  Vote Cast Successfully!
                </h2>
                <p className="text-walnut/60 mb-6">
                  Your vote has been recorded on the Algorand blockchain
                </p>

                {txHash && (
                  <div className="flex justify-center mb-6">
                    <BlockchainBadge txHash={txHash} />
                  </div>
                )}

                <div className="p-4 rounded-lg bg-verified/10 border border-verified/30 max-w-sm mx-auto mb-6">
                  <div className="flex items-center justify-center gap-2 text-verified">
                    <Flame className="w-5 h-5" />
                    <span className="font-medium">Vote token burned</span>
                  </div>
                  <p className="text-sm text-walnut/60 mt-1">
                    You cannot vote again in this election
                  </p>
                </div>

                <p className="text-xs text-walnut/40 italic">
                  &ldquo;Vox populi, vox Dei&rdquo; — The voice of the people is the voice of God
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
