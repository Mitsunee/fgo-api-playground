import spacetime from "spacetime";

export type TimeDiffer = ReturnType<typeof createTimeDiffer>;
export type TimeDiff = ReturnType<TimeDiffer>;

export const createTimeDiffer = (startTime?: number) => {
  const now = (startTime ? spacetime(startTime) : spacetime.now()).startOf(
    "second"
  );

  return function (deltaSeconds: number) {
    const then = now.add(deltaSeconds, "second");
    const { diff } = then.since(now);
    return {
      time: then.format("{time-24}:{second-pad}"),
      in: [diff.hours, diff.minutes, diff.seconds]
        .map(v => v.toString().padStart(2, "0"))
        .join(":")
    };
  };
};
