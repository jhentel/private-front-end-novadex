import * as Sentry from "@sentry/nextjs";

type LogArgs = {
  title: string;
  context?: any;
  level?: Sentry.SeverityLevel;
};

export default function sentryLogger({
  title,
  context,
  level = "error",
}: LogArgs) {
  return Sentry.withScope((scope) => {
    scope.setContext("Description", {
      ...context,
      timestamp: new Date().toISOString(),
    })
    scope.setLevel(level);
    Sentry.captureMessage(title);
  });
}
