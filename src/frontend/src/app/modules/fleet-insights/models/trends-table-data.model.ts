export interface TableValue {
  yearTimePoint: string;
  numberOfAircraft: number;
  percentageOfTotal: number;
}

export interface TableDataGroup {
  grouping: string;
  values: TableValue[];
}
