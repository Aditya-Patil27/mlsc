import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUserByEmail } from "@/lib/services/database";
import { createToken } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (passwordHash !== user.password_hash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
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

    const response = NextResponse.json({
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
    });

    // Set httpOnly cookie as well
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
