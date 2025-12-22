import { AssetWatchGridRequest } from './asset-watch-grid-request';

export class SavedSearchModel extends AssetWatchGridRequest {
  id!: number;
  name!: string;
  portfolioName!: string;
  description?: string;
  isActive!: boolean;
  userId!: string;
  dateCreated!: Date;
  dateModified!: Date;
}
