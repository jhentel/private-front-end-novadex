// app/api/tweet/route.ts
// import { fetchTwitterUserStatus } from "@/apis/rest/twitter";
import { NextRequest, NextResponse } from "next/server";
import { getTweet } from "react-tweet/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // const { searchParams } = new URL(req.url);
  const { id: tweetId } = await params;
  //  const url = searchParams.get("url");

  if (!tweetId || typeof tweetId !== "string") {
    return NextResponse.json({ error: "Bad Request." }, { status: 400 });
  }

  try {
    const tweet = await getTweet(tweetId);

    // if (!tweet && url) {
    //   const fallbackTweet = await fetchTwitterUserStatus(url);
    //   return NextResponse.json(
    //     { data: fallbackTweet ?? null },
    //     { status: fallbackTweet ? 200 : 404 },
    //   );
    // }

    return NextResponse.json(
      { data: tweet ?? null },
      { status: tweet ? 200 : 404 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : (error ?? "Bad request."),
      },
      { status: 400 },
    );
  }
}
