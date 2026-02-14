import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import algosdk from "algosdk";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mnemonic = process.env.ALGORAND_MNEMONIC;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing in .env.local");
  process.exit(1);
}

if (!mnemonic) {
  console.error("❌ ALGORAND_MNEMONIC missing in .env.local");
  process.exit(1);
}

const account = algosdk.mnemonicToSecretKey(mnemonic);
const realWalletAddress = account.addr;
console.log(`Using Wallet Address: ${realWalletAddress}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function getOrCreateUser(name: string, email: string, role: string, device: string | null = null) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    console.log(`✅ Found existing user: ${name} (${existingUser.id})`);
    // Update wallet address just in case it was a placeholder
    await supabase.from("users").update({ wallet_address: realWalletAddress }).eq("id", existingUser.id);
    console.log(`   Updated wallet address for ${name}`);
    return existingUser.id;
  }

  // Create new user
  const userId = uuidv4();
  const { error } = await supabase.from("users").insert({
    id: userId,
    name,
    email,
    role,
    wallet_address: realWalletAddress, // Use real address
    password_hash: "hashed_password",
    device_fingerprint: device,
  });

  if (error) {
    console.error(`❌ Error creating user ${name}:`, error.message);
    return null;
  }

  console.log(`✅ Created user: ${name} (${userId})`);
  return userId;
}

async function seedDatabase() {
  console.log("🌱 Seeding Database...");

  // 1. Get/Create Faculty
  const facultyId = await getOrCreateUser("Dr. Satoshi Nakamoto", "faculty@demo.com", "faculty");
  if (!facultyId) return;

  // 2. Get/Create Students
  const students = [
    { name: "Alice Blockchain", email: "alice@demo.com", device: "test-device-fingerprint-123" },
    { name: "Bob Crypto", email: "bob@demo.com", device: "test-device-fingerprint-456" },
    { name: "Charlie Decentralized", email: "charlie@demo.com", device: "test-device-fingerprint-789" },
    { name: "Diana Ledger", email: "diana@demo.com", device: "test-device-fingerprint-101" },
  ];

  let mainStudentId = "";

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const sId = await getOrCreateUser(s.name, s.email, "student", s.device);
    if (i === 0 && sId) mainStudentId = sId;
  }

  // 3. Create Active Session
  const sessionId = uuidv4();
  const qrNonce = crypto.randomBytes(8).toString("hex");
  const now = new Date();
  const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  const { error: sessionError } = await supabase.from("attendance_sessions").insert({
    id: sessionId,
    course_code: "CS404",
    course_name: "Decentralized Systems",
    faculty_id: facultyId,
    room: "Block C - 301",
    start_time: now.toISOString(),
    end_time: endTime.toISOString(),
    qr_nonce: qrNonce,
    geofence_lat: 18.5204, // Pune
    geofence_lng: 73.8567,
    geofence_radius: 5000, // Large radius for easy testing anywhere
    status: "active",
  });

  if (sessionError) {
    console.error("Error creating session:", sessionError.message);
  } else {
    console.log("\n✅ Active Session Created!");
    console.log("------------------------------------------------");
    console.log(`Session ID: ${sessionId}`);
    console.log(`QR Nonce:   ${qrNonce}`);
    console.log(`Student ID: ${mainStudentId} (Alice)`);
    console.log("------------------------------------------------");
    console.log(`\n➡️  Test URL: http://localhost:3000/student/attendance/mark/${sessionId}`);
  }
}

seedDatabase();
