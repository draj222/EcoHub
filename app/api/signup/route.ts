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
    try {
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
    } catch (error) {
      console.error("❌ Error checking existing user:", error);
      return NextResponse.json(
        { error: "Database error while checking user" },
        { status: 500 }
      );
    }

    // Hash password
    console.log("🔐 Hashing password...");
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("✅ Password hashed successfully");
    } catch (error) {
      console.error("❌ Error hashing password:", error);
      return NextResponse.json(
        { error: "Error processing password" },
        { status: 500 }
      );
    }

    // Create user
    console.log("👤 Creating new user...");
    try {
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

      console.log("✅ User created successfully:", {
        id: user.id,
        email: user.email,
      });

      return NextResponse.json(
        { 
          message: "User registered successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          }
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("❌ Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error during registration:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 