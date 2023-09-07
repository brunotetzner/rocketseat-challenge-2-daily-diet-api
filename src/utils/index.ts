import { isBefore, parseISO } from "date-fns";

export function compareDates(a: any, b: any): number {
  const dataA = parseISO(a.created_at);
  const dataB = parseISO(b.created_at);

  if (isBefore(dataA, dataB)) {
    return -1;
  } else if (isBefore(dataB, dataA)) {
    return 1;
  } else {
    return 0;
  }
}
