import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../frontend/.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log("🌱 Seeding Database...");

  // 1. Create Faculty
  const facultyId = uuidv4();
  const { error: facultyError } = await supabase.from("users").upsert({
    id: facultyId,
    name: "Dr. Satoshi Nakamoto",
    email: "faculty@demo.com",
    role: "faculty",
    wallet_address: "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUC35RCYDFCY2JP", // Placeholder
    password_hash: "hashed_password",
  }).select();

  if (facultyError) console.error("Error creating faculty:", facultyError.message);
  else console.log("✅ Faculty created: Dr. Satoshi Nakamoto");

  // 2. Create Student
  const studentId = uuidv4();
  const { error: studentError } = await supabase.from("users").upsert({
    id: studentId,
    name: "Alice Blockchain",
    email: "alice@demo.com",
    role: "student",
    wallet_address: "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUC35RCYDFCY2JP", // Placeholder
    password_hash: "hashed_password",
    device_fingerprint: "test-device-fingerprint-123", // Pre-register device for demo
  }).select();

  if (studentError) console.error("Error creating student:", studentError.message);
  else console.log("✅ Student created: Alice Blockchain");

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
    console.log(`Student ID: ${studentId}`);
    console.log("------------------------------------------------");
    console.log(`\n➡️  Test URL: http://localhost:3000/student/attendance/mark/${sessionId}`);
  }
}

seedDatabase();
