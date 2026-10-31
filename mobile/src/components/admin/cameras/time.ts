function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function frameTimestamp(ms: number): string {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function clockTime(ms: number): string {
  const date = new Date(ms);
  const hour = date.getHours();
  return `${hour % 12 || 12}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function ageLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min ago`;
}
