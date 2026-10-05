export const DAY_MS = 24 * 60 * 60 * 1000;

export const toUtcDateString = (date: Date) => date.toISOString().slice(0, 10);
