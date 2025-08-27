"use client";
import { useEffect } from "react";

export default function SetDarkThemeClient() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);
  return null;
}
