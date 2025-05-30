"use client";

import sentryLogger from "@/utils/sentry/SentryLogger";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    sentryLogger({
      title: "Global Error",
      context: {
        digest: error.digest || "no digest",
        errorMessage: error.message,
        stack: error.stack,
        fullError: error,
        time: new Date().toLocaleTimeString(),
      },
      level: "error",
    })
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
