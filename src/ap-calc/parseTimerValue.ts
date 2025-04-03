export function parseTimerValue(timerValue = "") {
  let timerSeconds = 300;
  if (timerValue) {
    const match = timerValue.match(/^([0-4]):?([0-5][0-9])$/);
    if (!match) {
      throw new Error(`Could not parse value for current timer: ${timerValue}`);
    }

    timerSeconds = Number(match[1]) * 60 + Number(match[2]);
  }

  return timerSeconds;
}
