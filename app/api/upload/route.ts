import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Upload request received");
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("❌ Unauthorized upload attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("✅ User authenticated:", session.user.email);

    // Parse the FormData
    const formData = await request.formData();
    console.log("📝 FormData received");
    
    // Log form data keys
    const formDataKeys: string[] = [];
    formData.forEach((_, key) => {
      formDataKeys.push(key);
    });
    console.log("📝 Form fields:", formDataKeys.join(", "));
    
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("❌ No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log("📁 File received:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log("❌ File too large:", `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    try {
      console.log("🔄 Processing file...");
      
      // Get file extension
      const ext = path.extname(file.name);
      // Generate unique filename
      const filename = `${uuidv4()}${ext}`;
      // Create uploads directory path
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Check if uploads directory exists, create it if not
      if (!existsSync(uploadsDir)) {
        console.log("📁 Creating uploads directory:", uploadsDir);
        await mkdir(uploadsDir, { recursive: true });
      }
      
      // Full file path
      const filepath = path.join(uploadsDir, filename);
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Write file to disk
      await writeFile(filepath, buffer);
      console.log("✅ File saved to:", filepath);
      
      // Generate public URL
      const fileUrl = `/uploads/${filename}`;
      console.log("🔗 Public URL generated:", fileUrl);

      return NextResponse.json({
        success: true,
        fileUrl,
        message: "File uploaded successfully"
      });
    } catch (error) {
      console.error("❌ Error processing file:", error);
      return NextResponse.json({ error: "Error processing file" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in upload handler:", error);
    return NextResponse.json({ 
      error: "Server error"
    }, { 
      status: 500 
    });
  }
} 
