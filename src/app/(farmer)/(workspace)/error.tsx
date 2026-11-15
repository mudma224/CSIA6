"use client";

import { RecoveryScreen } from "@/features/m5/RecoveryScreen";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RecoveryScreen kind="error" onRetry={reset} />;
}
