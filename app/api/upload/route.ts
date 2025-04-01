import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Log received file details
    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Basic validation
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.` },
        { status: 400 }
      );
    }

    // Create simple file extension mapping
    const typeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png", 
      "image/gif": "gif",
      "image/webp": "webp"
    };
    
    // Get appropriate extension based on mimetype
    const extension = typeToExt[file.type] || "jpg";
    
    // Create a unique filename
    const uniqueId = randomUUID();
    const filename = `${uniqueId}.${extension}`;
    
    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Full path for the file
    const filePath = path.join(uploadsDir, filename);
    
    try {
      // Convert file to buffer and write to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      console.log(`File successfully written to: ${filePath}`);
      
      // Return the URL path for the file (for use in <Image> components)
      const fileUrl = `/uploads/${filename}`;
      
      return NextResponse.json({
        success: true,
        fileUrl,
        message: "File uploaded successfully"
      });
    } catch (err) {
      console.error("Error writing file:", err);
      return NextResponse.json({ 
        error: "Error saving file to server" 
      }, { 
        status: 500 
      });
    }
  } catch (error) {
    console.error("Error in upload handler:", error);
    return NextResponse.json({ 
      error: "Server error processing upload" 
    }, { 
      status: 500 
    });
  }
} 
