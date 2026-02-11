import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not configured");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ---------------------------------------------------------------------------
// Database types
// ---------------------------------------------------------------------------

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  prn?: string;
  department?: string;
  year?: number;
  wallet_address: string;
  employee_id?: string;
  password_hash: string;
  device_fingerprint?: string;
  created_at: string;
}

export interface DbAttendanceSession {
  id: string;
  course_code: string;
  course_name: string;
  faculty_id: string;
  room: string;
  start_time: string;
  end_time: string;
  qr_nonce: string;
  geofence_lat: number;
  geofence_lng: number;
  geofence_radius: number;
  allowed_bssids: string[];
  bluetooth_beacon?: string;
  status: "active" | "ended" | "cancelled";
  created_at: string;
}

export interface DbAttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  timestamp: string;
  gps_lat: number;
  gps_lng: number;
  gps_accuracy: number;
  within_geofence: boolean;
  wifi_bssid?: string;
  wifi_verified: boolean;
  device_fingerprint: string;
  device_is_emulator: boolean;
  time_within_window: boolean;
  bluetooth_detected: boolean;
  ai_status: "legitimate" | "flagged" | "suspicious";
  ai_score: number;
  ai_reason?: string;
  tx_hash: string;
  status: "present" | "late" | "flagged" | "absent";
}

export interface DbHealthCredential {
  id: string;
  student_id: string;
  issuer_id: string;
  issuer_name: string;
  issued_date: string;
  valid_from: string;
  valid_to: string;
  credential_type: string;
  date_range_hash: string;
  issuer_hash: string;
  credential_type_hash: string;
  tx_hash: string;
  status: "valid" | "expired" | "revoked";
  created_at: string;
}

export interface DbLeaveRequest {
  id: string;
  student_id: string;
  credential_id: string;
  date_from: string;
  date_to: string;
  reason: string;
  zk_proof: string;
  ai_risk_score: number;
  ai_risk_level: string;
  ai_recommendation: string;
  status: "pending" | "approved" | "rejected" | "needs-review";
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
}

export interface DbCredentialNFT {
  id: string;
  nft_id: string;
  asset_id?: number;
  recipient_id: string;
  title: string;
  achievement: string;
  issuer: string;
  issuer_logo?: string;
  issued_date: string;
  category: string;
  event_name?: string;
  position?: string;
  metadata_url?: string;
  soulbound: boolean;
  tx_hash: string;
  verification_url: string;
  shares: number;
  verifications: number;
}

export interface DbElection {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  eligible_voter_count: number;
  vote_token_asa_id?: string;
  status: "upcoming" | "active" | "ended";
  created_by: string;
}

export interface DbCandidate {
  id: string;
  election_id: string;
  name: string;
  manifesto: string;
  image_url?: string;
  position: string;
  vote_count: number;
}

export interface DbVote {
  id: string;
  election_id: string;
  voter_hash: string;
  candidate_id: string;
  tx_hash: string;
  voted_at: string;
}

// ---------------------------------------------------------------------------
// User queries
// ---------------------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const { data } = await getSupabase()
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return data;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function createUser(
  user: Omit<DbUser, "created_at">
): Promise<DbUser> {
  const { data, error } = await getSupabase()
    .from("users")
    .insert(user)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Attendance session queries
// ---------------------------------------------------------------------------

export async function createAttendanceSession(
  session: Omit<DbAttendanceSession, "created_at">
): Promise<DbAttendanceSession> {
  const { data, error } = await getSupabase()
    .from("attendance_sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveSessionsByFaculty(
  facultyId: string
): Promise<DbAttendanceSession[]> {
  const { data } = await getSupabase()
    .from("attendance_sessions")
    .select("*")
    .eq("faculty_id", facultyId)
    .eq("status", "active")
    .order("start_time", { ascending: false });
  return data || [];
}

export async function getSessionById(
  id: string
): Promise<DbAttendanceSession | null> {
  const { data } = await getSupabase()
    .from("attendance_sessions")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function updateSessionStatus(
  id: string,
  status: "active" | "ended" | "cancelled"
) {
  const { error } = await getSupabase()
    .from("attendance_sessions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function updateSessionQRNonce(id: string, nonce: string) {
  const { error } = await getSupabase()
    .from("attendance_sessions")
    .update({ qr_nonce: nonce })
    .eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Attendance record queries
// ---------------------------------------------------------------------------

export async function createAttendanceRecord(
  record: DbAttendanceRecord
): Promise<DbAttendanceRecord> {
  const { data, error } = await getSupabase()
    .from("attendance_records")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAttendanceBySession(
  sessionId: string
): Promise<DbAttendanceRecord[]> {
  const { data } = await getSupabase()
    .from("attendance_records")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp", { ascending: true });
  return data || [];
}

export async function getStudentAttendance(
  studentId: string,
  limit = 50
): Promise<DbAttendanceRecord[]> {
  const { data } = await getSupabase()
    .from("attendance_records")
    .select("*")
    .eq("student_id", studentId)
    .order("timestamp", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function checkDuplicateAttendance(
  sessionId: string,
  studentId: string
): Promise<boolean> {
  const { data } = await getSupabase()
    .from("attendance_records")
    .select("id")
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .limit(1);
  return (data?.length || 0) > 0;
}

// ---------------------------------------------------------------------------
// Health credential queries
// ---------------------------------------------------------------------------

export async function createHealthCredential(
  cred: Omit<DbHealthCredential, "created_at">
): Promise<DbHealthCredential> {
  const { data, error } = await getSupabase()
    .from("health_credentials")
    .insert(cred)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHealthCredentialsByStudent(
  studentId: string
): Promise<DbHealthCredential[]> {
  const { data } = await getSupabase()
    .from("health_credentials")
    .select("*")
    .eq("student_id", studentId)
    .order("issued_date", { ascending: false });
  return data || [];
}

export async function getHealthCredentialById(
  id: string
): Promise<DbHealthCredential | null> {
  const { data } = await getSupabase()
    .from("health_credentials")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

// ---------------------------------------------------------------------------
// Leave request queries
// ---------------------------------------------------------------------------

export async function createLeaveRequest(
  req: Omit<DbLeaveRequest, "submitted_at">
): Promise<DbLeaveRequest> {
  const { data, error } = await getSupabase()
    .from("leave_requests")
    .insert(req)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingLeaveRequests(): Promise<DbLeaveRequest[]> {
  const { data } = await getSupabase()
    .from("leave_requests")
    .select("*")
    .in("status", ["pending", "needs-review"])
    .order("submitted_at", { ascending: false });
  return data || [];
}

export async function updateLeaveRequestStatus(
  id: string,
  update: {
    status: string;
    admin_notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
  }
) {
  const { error } = await getSupabase()
    .from("leave_requests")
    .update(update)
    .eq("id", id);
  if (error) throw error;
}

export async function getStudentLeaveRequests(
  studentId: string
): Promise<DbLeaveRequest[]> {
  const { data } = await getSupabase()
    .from("leave_requests")
    .select("*")
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });
  return data || [];
}

// ---------------------------------------------------------------------------
// Credential NFT queries
// ---------------------------------------------------------------------------

export async function createCredentialNFT(
  cred: DbCredentialNFT
): Promise<DbCredentialNFT> {
  const { data, error } = await getSupabase()
    .from("credential_nfts")
    .insert(cred)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCredentialsByRecipient(
  recipientId: string
): Promise<DbCredentialNFT[]> {
  const { data } = await getSupabase()
    .from("credential_nfts")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("issued_date", { ascending: false });
  return data || [];
}

export async function getCredentialByNFTId(
  nftId: string
): Promise<DbCredentialNFT | null> {
  const { data } = await getSupabase()
    .from("credential_nfts")
    .select("*")
    .eq("nft_id", nftId)
    .single();
  return data;
}

export async function incrementCredentialShares(id: string) {
  const { error } = await getSupabase().rpc("increment_shares", {
    credential_id: id,
  });
  if (error) throw error;
}

export async function incrementCredentialVerifications(id: string) {
  const { error } = await getSupabase().rpc("increment_verifications", {
    credential_id: id,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Election queries
// ---------------------------------------------------------------------------

export async function createElection(
  election: DbElection
): Promise<DbElection> {
  const { data, error } = await getSupabase()
    .from("elections")
    .insert(election)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveElections(): Promise<DbElection[]> {
  const { data } = await getSupabase()
    .from("elections")
    .select("*")
    .eq("status", "active");
  return data || [];
}

export async function getElectionById(
  id: string
): Promise<DbElection | null> {
  const { data } = await getSupabase()
    .from("elections")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getCandidatesByElection(
  electionId: string
): Promise<DbCandidate[]> {
  const { data } = await getSupabase()
    .from("candidates")
    .select("*")
    .eq("election_id", electionId)
    .order("vote_count", { ascending: false });
  return data || [];
}

export async function incrementCandidateVotes(candidateId: string) {
  const { error } = await getSupabase().rpc("increment_vote_count", {
    cand_id: candidateId,
  });
  if (error) throw error;
}

export async function recordVote(vote: DbVote): Promise<DbVote> {
  const { data, error } = await getSupabase()
    .from("votes")
    .insert(vote)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function hasUserVoted(
  electionId: string,
  voterHash: string
): Promise<boolean> {
  const { data } = await getSupabase()
    .from("votes")
    .select("id")
    .eq("election_id", electionId)
    .eq("voter_hash", voterHash)
    .limit(1);
  return (data?.length || 0) > 0;
}

// ---------------------------------------------------------------------------
// Proof usage (duplicate prevention)
// ---------------------------------------------------------------------------

export async function recordProofUsage(usage: {
  id: string;
  credential_id: string;
  purpose: string;
  verifier: string;
  tx_hash: string;
}) {
  const { error } = await getSupabase().from("proof_usages").insert(usage);
  if (error) throw error;
}

export async function checkProofUsed(credentialId: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("proof_usages")
    .select("id")
    .eq("credential_id", credentialId)
    .limit(1);
  return (data?.length || 0) > 0;
}
