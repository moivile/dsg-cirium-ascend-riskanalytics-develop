import { IdNamePairModel } from '../shared/models/id-name-pair-model';

export const primaryUsagesKey = 'primaryUsages';
export const statusKey = 'statuses';

export const primaryUsagesPriorityNames = ['Freight / Cargo', 'Passenger'];

export const statusPriorityNames = [
  'In Service',
  'Storage',
  'On Order',
  'Retired',
  'Type Swap',
  'Reengineered',
  'On Option',
  'Cancelled',
  'Letter of Intent to Option',
  'Letter of Intent to Order',
  'Written Off',
  'Miscellaneous'
];

export const defaultStatuses: IdNamePairModel[] = [
  { id: 5, name: 'In Service' },
  { id: 6, name: 'Storage' }
];

export const defaultStatusIds: number[] = defaultStatuses.map((status) => status.id);

/**
 * Maximum number of segments allowed for pie chart display.
 * When data exceeds this threshold, a bar chart is displayed instead.
 */
export const maxPieChartSegments = 10;
