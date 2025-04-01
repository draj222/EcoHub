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
      
      // Check if we're in production (Vercel) or development
      const isProduction = process.env.NODE_ENV === 'production';
      console.log(`🌐 Environment: ${isProduction ? 'Production' : 'Development'}`);
      
      let fileUrl = '';
      
      if (isProduction) {
        // In production, convert image to base64 for storage in database
        console.log("💾 Converting image to base64 for database storage...");
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert to base64 with data URL prefix for direct use in img tags
        const imageType = file.type;
        const base64Image = `data:${imageType};base64,${buffer.toString('base64')}`;
        console.log("✅ Image converted to base64 successfully");
        
        fileUrl = base64Image;
      } else {
        // In development, save to the file system
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
        fileUrl = `/uploads/${filename}`;
      }
      
      console.log("🔗 File URL generated:", fileUrl.substring(0, 50) + '...');

      return NextResponse.json({
        success: true,
        fileUrl,
        message: "File uploaded successfully"
      });
    } catch (error) {
      console.error("❌ Error processing file:", error);
      return NextResponse.json({ 
        error: "Error processing file",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in upload handler:", error);
    return NextResponse.json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    });
  }
} 
