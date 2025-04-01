import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log("🚀 File upload request received");
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("❌ Authentication failed - no session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log(`✅ Authenticated as user: ${session.user.email}`);

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      console.log("❌ No file found in request");
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Log received file details
    console.log(`📁 Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Basic validation
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.log(`❌ Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.` },
        { status: 400 }
      );
    }

    // Get file extension based on mime type
    const extensionMap = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp"
    };
    const extension = extensionMap[file.type as keyof typeof extensionMap] || "jpg";
    
    // Create a unique filename
    const uniqueId = randomUUID();
    const filename = `${uniqueId}.${extension}`;
    console.log(`📝 Generated filename: ${filename}`);
    
    // Ensure uploads directory exists
    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads");
    
    try {
      // Create directories if they don't exist
      if (!fs.existsSync(publicDir)) {
        console.log("📂 Creating public directory");
        fs.mkdirSync(publicDir);
      }
      
      if (!fs.existsSync(uploadsDir)) {
        console.log("📂 Creating uploads directory");
        fs.mkdirSync(uploadsDir);
      }
      
      // Set directory permissions
      fs.chmodSync(uploadsDir, 0o777);
      console.log(`📂 Upload directory permissions set: ${uploadsDir}`);
      
      // Convert file to buffer
      console.log("📤 Converting file to buffer...");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Full path for the file
      const filePath = path.join(uploadsDir, filename);
      
      // Write file synchronously to avoid potential async issues
      console.log(`💾 Writing file to: ${filePath}`);
      fs.writeFileSync(filePath, buffer);
      
      // Verify file was written successfully
      if (fs.existsSync(filePath)) {
        console.log(`✅ File successfully written to disk (${fs.statSync(filePath).size} bytes)`);
        
        // Return the URL path for the file
        const fileUrl = `/uploads/${filename}`;
        console.log(`🔗 File URL: ${fileUrl}`);
        
        return NextResponse.json({
          success: true,
          fileUrl,
          message: "File uploaded successfully"
        });
      } else {
        throw new Error("File was not written to disk");
      }
    } catch (fsError) {
      console.error("❌ Filesystem error:", fsError);
      console.error("Stack trace:", fsError instanceof Error ? fsError.stack : "No stack trace");
      
      return NextResponse.json({ 
        error: "Error saving file to server",
        details: fsError instanceof Error ? fsError.message : "Unknown filesystem error" 
      }, { 
        status: 500 
      });
    }
  } catch (error) {
    console.error("❌ Error in upload handler:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json({ 
      error: "Server error processing upload",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { 
      status: 500 
    });
  }
} 
