// User roles in the system
export type UserRole = "student" | "faculty" | "admin";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  metadata: {
    prn?: string;              // Student PRN (Permanent Registration Number)
    department?: string;
    year?: number;
    walletAddress: string;     // Algorand wallet address
    employeeId?: string;       // Faculty/Admin employee ID
  };
}

// Auth context state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
