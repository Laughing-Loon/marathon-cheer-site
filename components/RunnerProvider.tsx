"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_RUNNER, type Runner } from "@/lib/runner";

const RunnerContext = createContext<Runner>(DEFAULT_RUNNER);

/** Hands the server-loaded runner settings to client components. */
export function RunnerProvider({ runner, children }: { runner: Runner; children: ReactNode }) {
  return <RunnerContext.Provider value={runner}>{children}</RunnerContext.Provider>;
}

export const useRunner = () => useContext(RunnerContext);
