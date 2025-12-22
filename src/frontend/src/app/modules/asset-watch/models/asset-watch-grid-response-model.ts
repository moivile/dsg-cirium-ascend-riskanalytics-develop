import { AssetWatchGridModel } from '../../asset-watch/models/asset-watch-grid-model';

export interface AssetWatchGridResponseModel {
    assetWatchListDataGrid :AssetWatchGridModel[];
    totalResultCount:number;
}
