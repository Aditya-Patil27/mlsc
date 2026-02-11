# 🏛️ ALETHEIA — Trust Automated. Fraud Eliminated. Campus Revolutionized.

[![Built for Hackspiration'26](https://img.shields.io/badge/Built%20For-Hackspiration'26-blueviolet)]()
[![Blockchain](https://img.shields.io/badge/Blockchain-Algorand-00D4AA)]()
[![Track](https://img.shields.io/badge/Track-AI%20on%20Blockchain-green)]()
[![Prize Pool](https://img.shields.io/badge/Prize%20Pool-₹60,000-gold)]()

> **The complete Campus Trust Infrastructure on Algorand** — Bulletproof attendance verification, privacy-preserving health claims, soulbound NFT credentials, and transparent blockchain voting.

---

## 🎯 The Problem

Every campus in India faces the same fraud problems **daily**:

| Problem | Impact |
|---------|--------|
| **Proxy Attendance** | GPS spoofing, QR screenshot sharing, shouting "present" for friends |
| **Fake Medical Certificates** | ₹200 gets a fake certificate — admin has no way to verify |
| **Unverifiable Credentials** | Resume fraud with fake participation certificates |
| **Rigged Student Elections** | No transparency, double-voting, trust deficit |

Current "smart" attendance solutions (GPS-only, QR-only, WiFi-only) are all **easily defeated** by a single attack vector.

---

## 💡 Our Solution: CampusChain

**One platform. Zero fraud. Fully automated. Privacy preserved.**

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAMPUSCHAIN ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ 📍 ATTENDANCE │  │ 🔐 HEALTH     │  │ 🎓 CREDENTIALS│       │
│  │   Multi-factor│  │   ZK Proofs   │  │   NFT Certs   │       │
│  │   Anti-spoof  │  │   AI Fraud    │  │   Voting      │       │
│  │   Auto-record │  │   Privacy     │  │   Soulbound   │       │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘       │
│          └──────────────────┼──────────────────┘               │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              🤖 AI VERIFICATION LAYER                    │   │
│  │    Pattern Detection │ Anomaly Flagging │ Explanations   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ⛓️ ALGORAND BLOCKCHAIN                      │   │
│  │     Immutable │ Fast (4.5s) │ Cheap ($0.001) │ Green    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔥 Module 1: Bulletproof Attendance

**Multi-factor verification** — you actually have to **BE IN CLASS** to mark attendance.

| Factor | What It Checks |
|--------|---------------|
| 🌐 GPS + Geofence | Student is within campus boundaries |
| 📶 WiFi BSSID | Connected to the correct campus router |
| ⏰ Time Window | Within the lecture's scheduled time |
| 📱 Device Fingerprint | Student's registered device, no emulators |
| 🔵 Bluetooth (Optional) | Classroom-specific beacon detection |

**Anti-Spoofing**: Fake GPS fails WiFi check. WiFi spoofing fails GPS check. Can't defeat **both** simultaneously. AI detects anomalous patterns (boundary check-ins, instant WiFi disconnects, automated timing).

**On-chain**: Every attendance record is recorded as an Algorand transaction — immutable, verifiable, permanent.

---

## 🏥 Module 2: Privacy-Preserving Health Verification

**Zero-Knowledge Medical Leave** — prove you have a valid medical credential without revealing your diagnosis.

- **Student**: Generates a ZK proof that says "I have a valid credential from an authorized hospital covering these dates"
- **Admin**: Sees `All claims verified: TRUE ✅` — **without seeing diagnosis, hospital, or details**
- **AI layer**: Detects suspicious patterns (e.g., medical leave before every exam) and flags for review
- **Duplicate Prevention**: Blockchain prevents the same certificate from being used twice

---

## 🎓 Module 3: Verifiable Credentials & Voting

### Soulbound NFT Certificates (ARC-72)
- Hackathon wins, academic achievements, participation — minted as **non-transferable NFTs** on Algorand
- One-click verification for recruiters
- Share directly to LinkedIn with blockchain proof

### Transparent Campus Voting
- Each eligible student gets **one vote token** (ASA on Algorand)
- Voting **burns the token** — can't vote twice
- Results are **live on blockchain** — transparent, trustless
- Vote is anonymous but **counted forever on-chain**

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Blockchain** | Algorand TestNet | Immutable record storage |
| **Smart Contracts** | PyTeal (v8) | 3 contracts: Attendance, Health, Credentials/Voting |
| **SDK** | algosdk v2.7 | Algorand transaction building |
| **ZK Proofs** | snarkjs | Privacy-preserving health verification |
| **Frontend** | Next.js 14 + TypeScript | Full-stack web application |
| **UI** | Tailwind CSS + Radix UI + Framer Motion | Premium, animated interface |
| **AI** | Custom pattern detection engine | Anomaly detection, risk scoring |
| **Database** | Supabase (PostgreSQL) | Users, sessions, records, credentials |
| **Storage** | IPFS (Pinata) | NFT metadata |

### Algorand Features Used

| Feature | Use Case |
|---------|----------|
| **ASA** (Algorand Standard Assets) | Vote tokens, health credentials |
| **ARC-72 NFTs** | Soulbound certificates |
| **Box Storage** | Attendance records, proof hashes, vote records |
| **Atomic Transfers** | Multi-step operations |
| **Smart Contracts (ABI)** | On-chain verification logic |

---

## 📁 Project Structure

```
mlsc/
├── contracts/                      # Algorand Smart Contracts (PyTeal)
│   ├── attendance/
│   │   └── attendance_registry.py  # Attendance recording on-chain
│   ├── health/
│   │   └── health_credential.py    # Health credential SBT + ZK verify
│   ├── credentials/
│   │   └── certificate_voting.py   # NFT certs + on-chain voting
│   └── compile_all.py             # Compile all contracts to TEAL
│
├── frontend/                       # Next.js 14 Application
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Authentication
│   │   ├── student/               # Student portal (6 pages)
│   │   ├── faculty/               # Faculty portal (3 pages)
│   │   ├── admin/                 # Admin portal
│   │   └── api/                   # API routes (6 modules)
│   ├── components/                # Reusable UI components
│   ├── lib/services/              # Core business logic
│   │   ├── algorand.ts           # Algorand SDK integration
│   │   ├── ai.ts                 # AI anomaly detection engine
│   │   ├── database.ts           # Supabase data layer
│   │   ├── location.ts           # GPS/WiFi verification
│   │   ├── zk-proof.ts           # Zero-knowledge proof generation
│   │   └── auth.ts               # Authentication service
│   ├── data/mock/                 # Demo data
│   └── types/                     # TypeScript type definitions
│
├── CAMPUSCHAIN_HACKSPIRATION26.md  # Master strategy document
├── PITCH.md                        # Condensed pitch & demo guide
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+ (for contract compilation)
- A Supabase project
- An Algorand TestNet account

### 1. Clone & Install

```bash
git clone <repo-url>
cd mlsc
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your keys (see .env.example for reference)
```

### 3. Setup Database

Run the SQL in `frontend/supabase-schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Compile Smart Contracts (Optional)

```bash
cd contracts
pip install pyteal
python compile_all.py
```

---

## 🎬 Demo Flow

1. **Faculty** starts a lecture session → generates dynamic QR
2. **Student** marks attendance → multi-factor verification runs in real-time
3. **Blockchain** records the attendance → visible on AlgoExplorer
4. **Student** requests medical leave → ZK proof generated (privacy preserved)
5. **Admin** verifies → AI risk assessment → approve/flag
6. **Credential NFT** minted for achievements → soulbound, verifiable
7. **Student election** → vote with ASA token → results on-chain

---

## 👥 Team

**Team MLSC** — Vishwakarma Institute of Technology, Pune

---

## 📎 Links

- [Hackspiration'26](https://github.com/marotipatre/Hackseries-2-QuickStart-template) — Official Template
- [Algorand Developer Portal](https://dev.algorand.co/)
- [Presentation Template](https://docs.google.com/presentation/d/1Ns74rGOvzLxtAvUFik8UcUj2NCA7inKd/edit)

---

> **Built with 📍 Location Intelligence, 🔐 Zero-Knowledge Proofs, ⛓️ Algorand Blockchain, and 🤖 AI**
>
> *CampusChain — Trust Automated. Fraud Eliminated. Campus Revolutionized.*
