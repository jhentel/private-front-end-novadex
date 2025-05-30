"use client";

import MaxDepthErrorBoundary from "./MaxDepthErrorBoundary";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MaxDepthErrorBoundary>{children}</MaxDepthErrorBoundary>;
}
