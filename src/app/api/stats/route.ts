import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { TripStats } from "@/types";

/**
 * GET /api/stats?user_id=<uuid>
 * Returns aggregated travel statistics for a given user.
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
      .select("country, date_visited")
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch stats: ${error.message}` },
        { status: 500 }
      );
    }

    const countries = trips
      .map((t) => t.country)
      .filter((c): c is string => c !== null);

    const uniqueCountries = [...new Set(countries)];

    const dates = trips
      .map((t) => t.date_visited)
      .filter((d): d is string => d !== null)
      .sort();

    const stats: TripStats = {
      trip_count: trips.length,
      countries_visited: uniqueCountries,
      unique_country_count: uniqueCountries.length,
      date_range: {
        earliest: dates[0] ?? null,
        latest: dates[dates.length - 1] ?? null,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
