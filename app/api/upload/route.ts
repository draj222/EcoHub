import { NextRequest, NextResponse } from "next/server";
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

    // Size validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      console.log(`❌ File too large: ${file.size} bytes (max: ${MAX_SIZE} bytes)`);
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    try {
      // Convert file to Base64
      console.log("📤 Converting file to Base64...");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      
      // Create a data URL
      const fileUrl = `data:${file.type};base64,${base64String}`;
      console.log(`🔗 Base64 Data URL created (length: ${fileUrl.length} characters)`);
      
      // Return the data URL
      return NextResponse.json({
        success: true,
        fileUrl,
        message: "File converted successfully"
      });
    } catch (dataError) {
      console.error("❌ Error converting file:", dataError);
      console.error("Stack trace:", dataError instanceof Error ? dataError.stack : "No stack trace");
      
      return NextResponse.json({ 
        error: "Error processing image",
        details: dataError instanceof Error ? dataError.message : "Unknown conversion error" 
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
