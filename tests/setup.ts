import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  // DOM-based tests run in jsdom; node-environment tests (server modules) have no window.
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    sessionStorage.clear();
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }
});
