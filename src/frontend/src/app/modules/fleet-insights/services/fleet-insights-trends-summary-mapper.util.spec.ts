import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { adjustEndMonthDateForQuarterIntervalType } from './fleet-insights-trends-summary-mapper.util';
import { IntervalType } from '../models/interval-type.enum';
import { aircraftRequestDateFormat } from '../models/fleet-insights-aircraft-request';

dayjs.extend(quarterOfYear);

describe('adjustEndMonthDate', () => {
  // Helper to build a formatted month start string.
  const fmt = (d: dayjs.Dayjs): string => d.startOf('month').format(aircraftRequestDateFormat);

  // Helper to compute expected "last month of last fully completed quarter".
  const expectedLastCompletedQuarterMonth = (): string => {
    return dayjs().startOf('quarter').subtract(1, 'day').startOf('month').format(aircraftRequestDateFormat);
  };

  it('should return undefined when endMonthDate is undefined', () => {
    expect(adjustEndMonthDateForQuarterIntervalType(undefined, IntervalType.Quarter)).toBeUndefined();
  });

  it('should return original value when interval is not Quarter (Monthly)', () => {
    const dateStr = fmt(dayjs().year(2030).month(5));
    expect(adjustEndMonthDateForQuarterIntervalType(dateStr, IntervalType.Monthly)).toBe(dateStr);
  });

  it('should return original value when interval is not Quarter (Year)', () => {
    const dateStr = fmt(dayjs().year(2031).month(7));
    expect(adjustEndMonthDateForQuarterIntervalType(dateStr, IntervalType.Year)).toBe(dateStr);
  });

  it('should return original value when endMonthDate is invalid', () => {
    const invalid = 'not-a-date';
    expect(adjustEndMonthDateForQuarterIntervalType(invalid, IntervalType.Quarter)).toBe(invalid);
  });

  it('should adjust to last fully completed quarter end month for current year under Quarter interval', () => {
    const anyCurrentYearMonth = fmt(dayjs().month(0)); // January of current year
    const expected = expectedLastCompletedQuarterMonth();
    expect(adjustEndMonthDateForQuarterIntervalType(anyCurrentYearMonth, IntervalType.Quarter)).toBe(expected);
  });

  it('should adjust to December of past year under Quarter interval', () => {
    const pastYear = dayjs().year() - 1;
    const input = fmt(dayjs().year(pastYear).month(3)); // April of past year
    const expected = fmt(dayjs().year(pastYear).month(11)); // December of past year
    expect(adjustEndMonthDateForQuarterIntervalType(input, IntervalType.Quarter)).toBe(expected);
  });

  it('should adjust future year to last fully completed quarter end month under Quarter interval', () => {
    const futureYear = dayjs().year() + 1;
    const input = dayjs().year(futureYear).month(2).startOf('month').format(aircraftRequestDateFormat);
    const expected = expectedLastCompletedQuarterMonth();
    expect(adjustEndMonthDateForQuarterIntervalType(input, IntervalType.Quarter)).toBe(expected);
  });

  it('should be idempotent (calling twice gives same result)', () => {
    const pastYear = dayjs().year() - 2;
    const input = dayjs().year(pastYear).month(6).startOf('month').format(aircraftRequestDateFormat);
    const firstResult = adjustEndMonthDateForQuarterIntervalType(input, IntervalType.Quarter);
    if (firstResult === undefined) {
      throw new Error('Expected adjustEndMonthDate to return a defined value');
    }
    const secondResult = adjustEndMonthDateForQuarterIntervalType(firstResult, IntervalType.Quarter);
    expect(secondResult).toBe(firstResult);
  });
});
