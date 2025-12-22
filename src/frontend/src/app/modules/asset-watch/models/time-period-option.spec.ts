import { TimePeriodOption, getFilterPanelFormStartDate, getFilterPanelFormEndDate } from './time-period-option';
import * as dayjs from 'dayjs';

describe('TimePeriodOption', () => {
  it('should return correct start date for Yesterday', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Yesterday);
    expect(result.isSame(dayjs().subtract(1, 'day').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Last 7 Days', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Last7Days);
    expect(result.isSame(dayjs().subtract(7, 'day').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Last 1 month', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Last1Month);
    expect(result.isSame(dayjs().subtract(1, 'month').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Last 3 months', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Last3Months);
    expect(result.isSame(dayjs().subtract(3, 'month').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Last 6 months', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Last6Months);
    expect(result.isSame(dayjs().subtract(6, 'month').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Last 12 months', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.Last12Months);
    expect(result.isSame(dayjs().subtract(12, 'month').startOf('day'))).toBe(true);
  });

  it('should return correct start date for Custom', () => {
    const result = getFilterPanelFormStartDate(TimePeriodOption.SelectDateRange);
    expect(result.isSame(dayjs())).toBe(true);
  });

  it('should return correct end date', () => {
    const result = getFilterPanelFormEndDate();
    expect(result.isSame(dayjs().subtract(1, 'day').startOf('day'))).toBe(true);
  });
});
