import dayjs from 'dayjs';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export const allOwnershipOptions: IdNamePairModel[] = [
  { id: 1, name: 'Owner Operator' },
  { id: 2, name: 'Operating Lessor Managed / Owned' },
  { id: 3, name: 'Operating Lessor Managed Only' },
  { id: 4, name: 'Operating Lessor Owned and Managed' },
  { id: 5, name: 'Finance Lease' },
  { id: 6, name: 'Wet Lease' },
  { id: 7, name: 'Other' }
];

export const pastDateOwnershipOptions: IdNamePairModel[] = [
  allOwnershipOptions[0], // Owner Operator
  allOwnershipOptions[1], // Operating Lessor Managed / Owned
  allOwnershipOptions[4], // Finance Lease
  allOwnershipOptions[5], // Wet Lease
  allOwnershipOptions[6] // Other
];

export const currentDateOwnershipOptions: IdNamePairModel[] = [
  allOwnershipOptions[0], // Owner Operator
  allOwnershipOptions[2], // Operating Lessor Managed Only
  allOwnershipOptions[3], // Operating Lessor Owned and Managed
  allOwnershipOptions[4], // Finance Lease
  allOwnershipOptions[5], // Wet Lease
  allOwnershipOptions[6] // Other
];

export function getOwnershipOptionsForDate(date: Date): IdNamePairModel[] {
  const input = dayjs(date);
  const startOfThisMonth = dayjs().startOf('month');

  if (input.isBefore(startOfThisMonth, 'day')) {
    return pastDateOwnershipOptions;
  }

  return currentDateOwnershipOptions;
}
