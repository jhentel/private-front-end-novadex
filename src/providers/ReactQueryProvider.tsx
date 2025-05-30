"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import sentryLogger from "@/utils/sentry/SentryLogger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      sentryLogger({
        title: `Query Error: ${query.queryKey.join(",")}`,
        context: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause,
          fullError: error,
        },
        level: "error",
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      sentryLogger({
        title: `Mutation Error: ${mutation.options.mutationKey?.join(",")}`,
        context: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause,
          fullError: error,
        },
        level: "error",
      });
    },
  }),
});

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
