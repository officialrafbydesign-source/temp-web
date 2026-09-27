import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

export const dynamic =
  "force-dynamic";

const VALID_CATEGORIES =
  new Set([
    "beats",
    "music",
  ]);

export async function GET(
  request: Request
) {
  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      console.error(
        "Supabase public environment variables are missing"
      );

      return NextResponse.json(
        {
          error:
            "Release service is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const category =
      searchParams.get(
        "category"
      );

    if (
      category &&
      !VALID_CATEGORIES.has(
        category
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid release category",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        }
      );

    let query =
      supabase
        .from(
          "media_releases"
        )
        .select("*")
        .eq(
          "is_public",
          true
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (category) {
      query =
        query.eq(
          "category",
          category
        );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "Supabase releases query error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to load releases",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      data || [],
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/releases error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load releases",
      },
      {
        status: 500,
      }
    );
  }
}