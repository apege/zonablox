import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid Roblox username." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    // 1. Fetch user data from official Roblox API
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }),
      // Revalidate / cache for short period
      next: { revalidate: 60 },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Roblox servers. Please try again later.",
        },
        { status: 502 }
      );
    }

    const userData = await userRes.json();

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Roblox account "${cleanUsername}" was not found. Please check spelling.`,
      });
    }

    const robloxUser = userData.data[0];
    const userId = robloxUser.id;

    // 2. Fetch avatar headshot from Roblox Thumbnails API
    let avatarUrl = "";
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        }
      );

      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        if (thumbData.data && thumbData.data.length > 0) {
          avatarUrl = thumbData.data[0].imageUrl || "";
        }
      }
    } catch {
      // Non-fatal if avatar fetch fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: robloxUser.id,
        username: robloxUser.name,
        displayName: robloxUser.displayName,
        hasVerifiedBadge: robloxUser.hasVerifiedBadge || false,
        avatarUrl,
      },
    });
  } catch (error) {
    console.error("Roblox API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while verifying Roblox username.",
      },
      { status: 500 }
    );
  }
}
