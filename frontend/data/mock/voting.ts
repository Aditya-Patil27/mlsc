import { Election, Candidate, VoterEligibility } from "@/types";

// Mock elections
export const mockElections: Election[] = [
  {
    id: "ELEC001",
    title: "Student Council President 2026",
    description: "Vote for your next Student Council President. Your vote is anonymous but verifiable on the blockchain.",
    startDate: new Date("2026-02-08"),
    endDate: new Date("2026-02-15"),
    candidates: [
      {
        id: "CAND001",
        electionId: "ELEC001",
        name: "Rahul Sharma",
        manifesto: "Better hostel facilities, 24/7 library access, more hackathons",
        imageUrl: "/images/candidates/rahul.jpg",
        position: "President",
        voteCount: 342,
      },
      {
        id: "CAND002",
        electionId: "ELEC001",
        name: "Priya Patel",
        manifesto: "More industry connections, improved placement support, mental health initiatives",
        imageUrl: "/images/candidates/priya.jpg",
        position: "President",
        voteCount: 298,
      },
      {
        id: "CAND003",
        electionId: "ELEC001",
        name: "Amit Kumar",
        manifesto: "Sports infrastructure, cultural events, student welfare fund",
        imageUrl: "/images/candidates/amit.jpg",
        position: "President",
        voteCount: 187,
      },
    ],
    eligibleVoterCount: 1200,
    voteTokenAsaId: "ASA-VOTE-2026-001",
    status: "active",
    createdBy: "ADM001",
  },
];

// Mock voter eligibility
export const mockVoterEligibility: VoterEligibility = {
  studentId: "STU001",
  electionId: "ELEC001",
  isEligible: true,
  hasVoted: false,
  voteToken: "VT-2026-STU001",
};
