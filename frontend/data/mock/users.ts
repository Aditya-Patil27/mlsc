import { User } from "@/types";

// Mock users for each role
export const mockUsers: Record<string, User> = {
  student: {
    id: "STU001",
    name: "Aditya Prashant Patil",
    email: "aditya.patil@vit.edu",
    role: "student",
    avatar: "/images/avatars/student.jpg",
    metadata: {
      prn: "12345",
      department: "Computer Science",
      year: 3,
      walletAddress: "ALGO7XNLQ3KCQHVMF2TML4HKPX5Y6Z7A8B9C0D1E2F3G4H5I6J",
    },
  },
  faculty: {
    id: "FAC001",
    name: "Prof. Sharma",
    email: "sharma@vit.edu",
    role: "faculty",
    avatar: "/images/avatars/faculty.jpg",
    metadata: {
      department: "Computer Science",
      employeeId: "EMP-2019-CS-042",
      walletAddress: "ALGOFACULTY1234567890ABCDEFGHIJKLMNOPQRSTU",
    },
  },
  admin: {
    id: "ADM001",
    name: "Dr. Kulkarni",
    email: "admin@vit.edu",
    role: "admin",
    avatar: "/images/avatars/admin.jpg",
    metadata: {
      department: "Administration",
      employeeId: "EMP-2015-ADM-001",
      walletAddress: "ALGOADMIN1234567890ABCDEFGHIJKLMNOPQRSTUV",
    },
  },
};

// Additional mock students for attendance demos
export const mockStudents: User[] = [
  mockUsers.student,
  {
    id: "STU002",
    name: "Rahul Sharma",
    email: "rahul.sharma@vit.edu",
    role: "student",
    metadata: {
      prn: "12346",
      department: "Computer Science",
      year: 3,
      walletAddress: "ALGO8YNMQ4LDRIS2NG3UNK5JPLY6Z8A9B0C1D2E3F4G5H6I7J",
    },
  },
  {
    id: "STU003",
    name: "Priya Patel",
    email: "priya.patel@vit.edu",
    role: "student",
    metadata: {
      prn: "12347",
      department: "Computer Science",
      year: 3,
      walletAddress: "ALGO9ZOPQ5MESKT3OH4VOL6KMQZ7A0B1C2D3E4F5G6H7I8J",
    },
  },
  {
    id: "STU004",
    name: "Amit Kumar",
    email: "amit.kumar@vit.edu",
    role: "student",
    metadata: {
      prn: "12348",
      department: "Computer Science",
      year: 3,
      walletAddress: "ALGO0APQR6NFTLU4PI5WPM7LNRA8B1C2D3E4F5G6H7I8J9K",
    },
  },
  {
    id: "STU005",
    name: "Sneha Gupta",
    email: "sneha.gupta@vit.edu",
    role: "student",
    metadata: {
      prn: "12349",
      department: "Computer Science",
      year: 3,
      walletAddress: "ALGO1BQRS7OGUVM5QJ6XQN8MOSB9C2D3E4F5G6H7I8J9K0L",
    },
  },
];
