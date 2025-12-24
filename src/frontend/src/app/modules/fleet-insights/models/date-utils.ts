import dayjs from 'dayjs';

export function isPastMonth(date: Date): boolean {
  const input = dayjs(date);
  const currentMonth = dayjs();

  return input.isBefore(currentMonth, 'month');
}
