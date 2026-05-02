import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireOrganizer } from "@/lib/apiAuth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { error } = requireOrganizer(request);
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary in event-booking folder
    const result = await cloudinary.uploader.upload(base64, {
      folder: "event-booking",
      transformation: [{ width: 1280, height: 720, crop: "fill" }],
    });

    return NextResponse.json(
      { url: result.secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}