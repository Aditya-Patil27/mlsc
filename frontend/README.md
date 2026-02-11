# CampusChain Frontend

> **"Trust Automated. Fraud Eliminated. Campus Revolutionized."**

A revolutionary academic credential verification platform that combines medieval scholastic aesthetics ("Digital Scholastica") with blockchain technology, built for Hackspiration'26.

## Features

### Core Modules

1. **Bulletproof Attendance System**
   - Multi-factor verification: GPS + WiFi + Device + Time + Bluetooth
   - AI anomaly detection
   - Real-time faculty dashboard
   - On-chain recording via Algorand

2. **Privacy-First Health Verification**
   - Zero-Knowledge proofs for medical leave
   - Verify claims without revealing diagnosis
   - AI fraud pattern detection
   - Duplicate claim prevention

3. **NFT Credentials & Voting**
   - Soulbound NFT certificates
   - Instant verification via QR/link
   - Transparent blockchain voting
   - Token burn mechanism for vote integrity

### User Roles

- **Student**: Mark attendance, manage credentials, generate ZK proofs, vote
- **Faculty**: Start lectures, monitor live attendance, review anomalies
- **Admin**: Verify claims, issue credentials, system analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Animation**: Framer Motion
- **Blockchain**: Algorand (algosdk)
- **UI Components**: Radix UI primitives

## Design System: "Digital Scholastica"

### Typography
- **Headings**: Cormorant Garamond (serif, traditional)
- **Body**: Source Serif 4 (readable serif)
- **Technical**: JetBrains Mono (monospace for hashes)
- **Accents**: Syne (modern sans)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Oxford | #1A1F3A | Primary dark |
| Crimson | #8B1538 | Wax seals, accents |
| Parchment | #F4EFE0 | Light backgrounds |
| Gold | #B8860B | Highlights |
| Electric Cyan | #00FFFF | Blockchain verification |

### Animations
- Wax seal stamp effects
- Certificate materialization
- Holographic QR codes
- Verification pulses
- Confetti celebrations

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication
│   ├── student/           # Student portal
│   ├── faculty/           # Faculty portal
│   └── admin/             # Admin portal
├── components/
│   ├── ui/                # Base UI components
│   ├── shared/            # Wax seal, blockchain badge, etc.
│   ├── attendance/        # Attendance-specific components
│   ├── health/            # Health verification components
│   ├── credentials/       # NFT certificate components
│   └── voting/            # Voting components
├── lib/
│   ├── contexts/          # React contexts (auth)
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── types/                 # TypeScript type definitions
└── data/mock/             # Mock data for demo
```

## Demo Flow

### Student Experience
1. Login → Select "Student" role
2. Dashboard → View credentials and stats
3. Attendance → Mark with multi-factor verification
4. Health → Generate ZK proof for medical leave
5. Vote → Cast vote in student elections

### Faculty Experience
1. Login → Select "Faculty" role
2. Dashboard → Overview of today's classes
3. Start Lecture → Begin attendance session
4. Live Dashboard → Monitor real-time attendance

### Admin Experience
1. Login → Select "Admin" role
2. Dashboard → System overview
3. Verify → Review pending leave requests
4. Credentials → Issue NFT certificates

## Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with ceremonial gate effect |
| `/login` | Role selection for demo |
| `/student/dashboard` | Student home with credential gallery |
| `/student/attendance/mark/[sessionId]` | Multi-factor attendance marking |
| `/student/health` | ZK proof generation |
| `/student/credentials` | NFT certificate gallery |
| `/student/vote` | Blockchain voting |
| `/faculty/dashboard` | Faculty overview |
| `/faculty/lectures/[id]/live` | Real-time attendance dashboard |
| `/admin/dashboard` | Admin analytics |

## Built With

- [Next.js 14](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Algorand SDK](https://developer.algorand.org/)

## License

MIT

---

Built for **Hackspiration'26** | AI + Automation in Blockchain Track
