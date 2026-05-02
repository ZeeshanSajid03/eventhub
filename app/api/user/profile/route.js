import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";
import bcrypt from "bcryptjs";

// GET current user profile
export async function GET(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const userData = await User.findById(user.userId).select("-password");
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT update profile
export async function PUT(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    const { name, email, currentPassword, newPassword, avatar } = await request.json();

    const userData = await User.findById(user.userId);
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If changing email check it's not taken
    if (email && email !== userData.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 409 }
        );
      }
      userData.email = email;
    }

    if (name) userData.name = name;
    if (avatar !== undefined) userData.avatar = avatar;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, userData.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      userData.password = await bcrypt.hash(newPassword, 12);
    }

    await userData.save();

    const updated = userData.toObject();
    delete updated.password;

    return NextResponse.json(
      { message: "Profile updated successfully", user: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE account
export async function DELETE(request) {
  try {
    const { error, user } = requireAuth(request);
    if (error) return error;

    await connectDB();

    await User.findByIdAndDelete(user.userId);

    const response = NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}