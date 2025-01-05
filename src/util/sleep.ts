export function sleep(length = 250) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), length));
}
