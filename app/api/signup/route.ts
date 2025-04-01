import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration request received");
    
    const { name, email, password } = await request.json();
    console.log("📝 Registration data:", { name, email, password: "***" });

    // Validate input
    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log("🔍 Checking if user exists:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log("👤 Creating new user...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("✅ User created successfully:", user.email);
    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
} 