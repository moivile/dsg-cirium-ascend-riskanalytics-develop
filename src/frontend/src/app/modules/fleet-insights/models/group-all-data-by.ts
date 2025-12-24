export const enum GroupAllDataByOptions {
  Status = 0,
  PrimaryUsage = 1,
  MarketClass = 2,
  Operator = 3,

  OperatorRegion = 4,

  OperatorCountry = 5,

  OperatorType = 6,
  Lessor = 7,

  AircraftManufacturer = 8,

  AircraftFamily = 9,

  AircraftType = 10,

  AircraftMasterSeries = 11,

  AircraftSeries = 12,

  AircraftSubSeries = 13,

  EngineManufacturer = 14,

  EngineFamily = 15,

  EngineType = 16,

  EngineMasterSeries = 17,

  EngineSeries = 18,

  EngineSubSeries = 19,

  Age = 20,

  Ownership = 21,

  EventTypes = 22,

  EventDetails = 23
}

export const GroupAllDataByLabels: { [key in GroupAllDataByOptions]: string } = {
  [GroupAllDataByOptions.Status]: 'Status',
  [GroupAllDataByOptions.PrimaryUsage]: 'Primary Usage',
  [GroupAllDataByOptions.MarketClass]: 'Market Class',
  [GroupAllDataByOptions.Operator]: 'Operator',
  [GroupAllDataByOptions.OperatorRegion]: 'Operator Region',
  [GroupAllDataByOptions.OperatorCountry]: 'Operator Country/Subregion',
  [GroupAllDataByOptions.OperatorType]: 'Operator Type',
  [GroupAllDataByOptions.Lessor]: 'Lessor',
  [GroupAllDataByOptions.AircraftManufacturer]: 'Aircraft Manufacturer',
  [GroupAllDataByOptions.AircraftFamily]: 'Aircraft Family',
  [GroupAllDataByOptions.AircraftType]: 'Aircraft Type',
  [GroupAllDataByOptions.AircraftMasterSeries]: 'Aircraft Master Series',
  [GroupAllDataByOptions.AircraftSeries]: 'Aircraft Series',
  [GroupAllDataByOptions.AircraftSubSeries]: 'Aircraft Sub Series',
  [GroupAllDataByOptions.EngineManufacturer]: 'Engine Manufacturer',
  [GroupAllDataByOptions.EngineFamily]: 'Engine Family',
  [GroupAllDataByOptions.EngineType]: 'Engine Type',
  [GroupAllDataByOptions.EngineMasterSeries]: 'Engine Master Series',
  [GroupAllDataByOptions.EngineSeries]: 'Engine Series',
  [GroupAllDataByOptions.EngineSubSeries]: 'Engine Sub Series',
  [GroupAllDataByOptions.Age]: 'Age',
  [GroupAllDataByOptions.Ownership]: 'Ownership',
  [GroupAllDataByOptions.EventTypes]: 'Event Types',
  [GroupAllDataByOptions.EventDetails]: 'Event Details'
};
