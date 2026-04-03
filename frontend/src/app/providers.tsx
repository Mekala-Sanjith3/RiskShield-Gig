"use client";

import { RiskShieldProvider } from "../context/RiskShieldContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <RiskShieldProvider>{children}</RiskShieldProvider>;
}

