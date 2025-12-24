export interface FleetInsightsFiltersRequest {
  statusIds?: number[];
  primaryUsageIds?: number[];
  marketClassIds?: number[];
  lessorIds?: number[];

  manufacturerIds?: number[];
  aircraftTypeIds?: number[];
  aircraftFamilyIds?: number[];
  aircraftMasterSeriesIds?: number[];
  aircraftSeriesIds?: number[];
  aircraftSubSeriesIds?: number[];

  engineTypeIds?: number[];
  engineManufacturerIds?: number[];
  engineFamilyIds?: number[];
  engineMasterSeriesIds?: number[];
  engineSeriesIds?: number[];
  engineSubSeriesIds?: number[];

  aircraftOperatorIds?: number[];
  operatorTypeIds?: number[];
  operatorGroupIds?: number[];
  operatorRegionIds?: number[];
  operatorCountryIds?: number[];
  availabilityIds?: number[];
}
