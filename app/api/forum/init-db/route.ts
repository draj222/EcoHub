import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    // Check if an admin user already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        email: "admin@ecohub.com",
      },
    });

    if (adminExists) {
      return NextResponse.json({
        message: "Admin user already exists",
        userId: adminExists.id,
      });
    }

    // Create an admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await prisma.user.create({
      data: {
        name: "EcoHub Admin",
        email: "admin@ecohub.com",
        password: hashedPassword,
        image: "https://api.dicebear.com/6.x/bottts-neutral/svg?seed=admin",
      },
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      userId: adminUser.id,
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
} 