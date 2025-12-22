import { FlightDetailsTableModel } from '../../asset-watch/models/flight-details-table-model';

export interface FlightDetailsResponseModel {
    flightDetails :FlightDetailsTableModel[];
    totalResultCount:number;
}
