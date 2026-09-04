"use client";

import { useState, useEffect } from "react";

export function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });

    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export interface SvgPalette {
  nodeFill: string;
  nodeStroke: string;
  nodeText: string;
  activeNodeFill: string;
  activeNodeStroke: string;
  activeNodeText: string;
  endNodeFill: string;
  endNodeStroke: string;
  edgeStroke: string;
  activeEdgeStroke: string;
  arrowFill: string;
  labelFill: string;
  bgSubtle: string;
}

export function useSvgPalette(): SvgPalette {
  return {
    nodeFill: "#151515",
    nodeStroke: "#474747",
    nodeText: "#c1c1c1",
    activeNodeFill: "#212121",
    activeNodeStroke: "#98ff38",
    activeNodeText: "#f3f3f3",
    endNodeFill: "#080808",
    endNodeStroke: "#98ff38",
    edgeStroke: "#474747",
    activeEdgeStroke: "#98ff38",
    arrowFill: "#9c9c9c",
    labelFill: "#9c9c9c",
    bgSubtle: "#101010",
  };
}
