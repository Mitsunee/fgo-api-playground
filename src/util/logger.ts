import { createLogger } from "@foxkit/logger";
import { createColors } from "picocolors";
import spacetime from "spacetime";

const col = createColors(true);

export function timer() {
  const start = spacetime.now();
  return () => {
    const end = spacetime.now();
    return end.since(start).abbreviated.join(" ") || "under 1s";
  };
}

const { log, logger } = createLogger({
  levels: [
    { name: "Debug", color: col.gray },
    { name: "Info", color: col.cyanBright },
    { name: "Success", color: col.greenBright },
    { name: "Warn", color: col.yellowBright, type: "warn" },
    { name: "Error", color: col.redBright, type: "error" },
    {
      name: "Fatal",
      color: col.bgRed,
      type: "error",
      colorMode: "full",
      template: "%#NAME%:"
    }
  ],
  defaultLevel: "Info",
  template: "%#name% -",
  inspectOpts: { colors: true, depth: 4 }
});

export { log, logger };
