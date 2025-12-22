export interface SearchAircraftRequest {
  keyword?: string;
  manufacturerIds?: number[];
  aircraftTypeIds?: number[];
  aircraftMasterSeriesIds?: number[];
  aircraftOperatorIds?: number[];
  operatorCountryIds?: number[];
  lessorIds?: number[];
  companyTypeIds?: number[];
  statusIds?: number[];
  skip: number;
  take: number;
}
