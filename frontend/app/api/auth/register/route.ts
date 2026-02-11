import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { createUser, getUserByEmail } from "@/lib/services/database";
import { createToken } from "@/lib/services/auth";
import type { UserRole } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, prn, department, year, employeeId } =
      body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "name, email, password, and role are required" },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["student", "faculty", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Generate a deterministic wallet address placeholder
    // In production, user would connect their Algorand wallet
    const walletAddress = `ALGO${crypto
      .createHash("sha256")
      .update(email)
      .digest("hex")
      .slice(0, 52)
      .toUpperCase()}`;

    const userId = uuidv4();

    const user = await createUser({
      id: userId,
      name,
      email,
      role,
      prn: role === "student" ? prn : undefined,
      department,
      year: role === "student" ? year : undefined,
      wallet_address: walletAddress,
      employee_id: role !== "student" ? employeeId : undefined,
      password_hash: passwordHash,
    });

    const token = await createToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      metadata: {
        prn: user.prn,
        department: user.department,
        year: user.year,
        walletAddress: user.wallet_address,
        employeeId: user.employee_id,
      },
    });

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          metadata: {
            prn: user.prn,
            department: user.department,
            year: user.year,
            walletAddress: user.wallet_address,
            employeeId: user.employee_id,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
