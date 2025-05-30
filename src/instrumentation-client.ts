import * as Sentry from "@sentry/nextjs";
// This export will instrument router navigations, and is only relevant if you enable tracing.
// `captureRouterTransitionStart` is available from SDK version 9.12.0 onwards
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: "https://11aa4996194b51a29c58d195e09a77ad@o4508983779000320.ingest.de.sentry.io/4508983833002064",
  integrations: [
    // Add browser profiling integration to the list of integrations
    Sentry.browserProfilingIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: ["localhost"],

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // result in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 1.0,
});
