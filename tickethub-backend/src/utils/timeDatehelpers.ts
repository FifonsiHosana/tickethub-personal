export function formatDateForMySQL(date: Date) {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

export const now = () => formatDateForMySQL(new Date());

export function formatDateReadable(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const year = d.getFullYear();

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  return `${day}${suffix} ${month} ${year}`;
}
