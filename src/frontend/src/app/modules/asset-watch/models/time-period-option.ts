import dayjs from 'dayjs';

/* eslint-disable @typescript-eslint/no-explicit-any*/
export enum TimePeriodOption {
  Yesterday = <any>'Yesterday',
  Last7Days = <any>'Last 7 days',
  Last1Month = <any>'Last 1 month',
  Last3Months = <any>'Last 3 months',
  Last6Months = <any>'Last 6 months',
  Last12Months = <any>'Last 12 months',
  SelectDateRange = <any>'Custom'
}

export const getFilterPanelFormStartDate = (timePeriod: TimePeriodOption): dayjs.Dayjs => {
  if (timePeriod === TimePeriodOption.Yesterday) {
    return dayjs().subtract(1, 'day').startOf('day');
  } else if (timePeriod === TimePeriodOption.Last7Days) {
    return dayjs().subtract(7, 'day').startOf('day');
  } else if (timePeriod === TimePeriodOption.Last1Month) {
    return dayjs().subtract(1, 'month').startOf('day');
  } else if (timePeriod === TimePeriodOption.Last3Months) {
    return dayjs().subtract(3, 'month').startOf('day');
  } else if (timePeriod === TimePeriodOption.Last6Months) {
    return dayjs().subtract(6, 'month').startOf('day');
  } else if (timePeriod === TimePeriodOption.Last12Months) {
    return dayjs().subtract(12, 'month').startOf('day');
  } else {
    return dayjs();
  }
};

export const getFilterPanelFormEndDate = (): dayjs.Dayjs => {
  const startOfToday = dayjs().subtract(1, 'day').startOf('day');
  return startOfToday;
};

export function getTimePeriodEnumValue(timePeriodString: string): TimePeriodOption {
  if (timePeriodString in TimePeriodOption) {
    return TimePeriodOption[timePeriodString as keyof typeof TimePeriodOption];
  } else {
    return TimePeriodOption.SelectDateRange;
  }
}
