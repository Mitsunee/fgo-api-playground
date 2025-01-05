/* eslint-disable @typescript-eslint/no-unused-vars */

export function listToMap<T extends { id: number }>(
  items: Array<T>,
  partial: true
): Partial<Record<ID, T>>;
export function listToMap<T extends { id: number }>(
  items: Array<T>,
  partial?: false
): Record<ID, T>;
export function listToMap<T extends { id: number }>(
  items: Array<T>,
  partial?: boolean
) {
  const record: Record<ID, T> = {};
  for (const item of items) {
    record[item.id] = item;
  }
  return record;
}
