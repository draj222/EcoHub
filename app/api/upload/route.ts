import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
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

    // Verify content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      console.log(`Invalid content type: ${contentType}. Expected multipart/form-data.`);
      console.log("Headers:", Object.fromEntries(request.headers.entries()));
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    console.log("Received file upload request:", 
      file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : "No file"
    );
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}. Allowed types: ${validTypes.join(', ')}`);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP are allowed.` },
        { status: 400 }
      );
    }

    try {
      // Create a unique filename
      const buffer = await file.arrayBuffer();
      const uniqueId = randomUUID();
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${uniqueId}.${extension}`;
      
      // Ensure the uploads directory exists
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      console.log(`Upload directory: ${uploadDir}`);
      
      // Write the file
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, Buffer.from(buffer));
      console.log(`File written to: ${filepath}`);
      
      // Return the file URL
      const fileUrl = `/uploads/${filename}`;
      console.log(`File URL: ${fileUrl}`);
      
      return NextResponse.json({ 
        success: true, 
        fileUrl 
      });
    } catch (fileError: unknown) {
      console.error("File processing error:", fileError);
      return NextResponse.json(
        { error: `Error processing file: ${fileError instanceof Error ? fileError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
} 
