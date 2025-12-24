import dayjs from 'dayjs';

export enum IntervalType {
  Monthly = 1,
  Quarter = 2,
  Year  = 3
}

export const defaultStartDateMonthly = dayjs().startOf('month').subtract(11, 'month');
export const defaultEndDateMonthly   = dayjs().startOf('month');

export function getIntervalTypeLabel(intervalType: IntervalType): string {
  switch (intervalType) {
    case IntervalType.Monthly:
      return 'Monthly';
    case IntervalType.Quarter:
      return 'Quarterly';
    case IntervalType.Year:
      return 'Yearly';
    default:
      return 'Unknown';
  }
}
