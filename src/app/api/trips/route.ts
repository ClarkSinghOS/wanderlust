import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

/**
 * GET /api/trips?user_id=<uuid>
 * Returns all trips for a given user, ordered by date_visited descending.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: trips, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .order("date_visited", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch trips: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Trips fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
