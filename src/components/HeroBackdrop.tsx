"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";
import { canUseWebGL } from "@/lib/webgl";

function HeroFallback() {
  return <div className="hero-canvas hero-fallback" aria-hidden="true" />;
}

const HeroScene = dynamic(
  () => import("./hero/HeroScene").then((module) => module.HeroScene),
  { ssr: false, loading: () => <HeroFallback /> },
);

class HeroErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return <HeroFallback />;
    return this.props.children;
  }
}

export function HeroBackdrop() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      if (!canUseWebGL()) {
        setEnabled(false);
        return;
      }
      inner = window.requestAnimationFrame(() => setReady(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, []);

  if (!enabled || failed || !ready) return <HeroFallback />;

  return (
    <HeroErrorBoundary onError={() => setFailed(true)}>
      <HeroScene onUnavailable={() => setFailed(true)} />
    </HeroErrorBoundary>
  );
}
