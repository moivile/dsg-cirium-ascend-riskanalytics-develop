export interface SummaryDatePointValue {
  year: number;
  timePoint: string;
  numberOfAircraft: number;
  percentageOfTotal: number;
}

export interface GroupSummaryWithTimeline {
  grouping: string;
  values: SummaryDatePointValue[];
}

export interface SummaryResponseModel {
  summaryList?: GroupSummaryWithTimeline[];
}
