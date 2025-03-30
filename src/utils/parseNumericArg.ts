import { log } from "./logger";

interface NumericArgumentOpts<TFallback = undefined> {
  value: string | undefined;
  name: string;
  min?: number;
  max?: number;
  fallback?: TFallback;
}

export function parseNumericArg<TFallback = undefined>(
  opts: NumericArgumentOpts<TFallback>
): TFallback | number {
  // handle missing value
  if (typeof opts.value == "undefined") {
    if (typeof opts.fallback !== "undefined") {
      log.warn(`Using '${opts.fallback}' as fallback value for ${opts.name}`);
    }
    return opts.fallback as TFallback; // typescript being stupid here lol
  }

  // build error message
  let err = `Could not parse argument for ${opts.name} '${opts.value}'. Argument must be integer `;
  if (typeof opts.min == "number") {
    if (typeof opts.max == "number") {
      err += `from ${Math.trunc(opts.min)} to ${Math.trunc(opts.max)}.`;
    } else {
      err += `>= ${Math.trunc(opts.min)}.`;
    }
  } else if (typeof opts.max == "number") {
    err += `<= ${Math.trunc(opts.max)}.`;
  }

  // parse and validate value
  const value = parseInt(opts.value);
  if (
    isNaN(value) ||
    (typeof opts.min == "number" && value < opts.min) ||
    (typeof opts.max == "number" && value > opts.max)
  ) {
    log.error(err);
    if (typeof opts.fallback !== "undefined") {
      log.warn(`Using '${opts.fallback}' as fallback value for ${opts.name}`);
      return opts.fallback;
    }
  }

  return value;
}
