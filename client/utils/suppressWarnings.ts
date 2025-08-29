// Utility to suppress specific React warnings from third-party libraries
// This specifically targets the recharts defaultProps deprecation warnings

let originalConsoleWarn: typeof console.warn;

export const suppressRechartsWarnings = () => {
  if (process.env.NODE_ENV === "development") {
    originalConsoleWarn = console.warn;

    console.warn = (...args: any[]) => {
      // Suppress recharts defaultProps warnings
      const message = args[0]?.toString?.() || "";

      if (
        message.includes(
          "Support for defaultProps will be removed from function components",
        ) &&
        (message.includes("XAxis") ||
          message.includes("YAxis") ||
          message.includes("recharts"))
      ) {
        // Suppress this specific warning
        return;
      }

      // Allow all other warnings
      originalConsoleWarn.apply(console, args);
    };
  }
};

export const restoreConsoleWarn = () => {
  if (originalConsoleWarn) {
    console.warn = originalConsoleWarn;
  }
};

// Auto-suppress on import
suppressRechartsWarnings();
