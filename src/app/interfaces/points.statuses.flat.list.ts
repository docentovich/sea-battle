import {PointStatus} from '../entity/point';

export interface PointsStatusFlatList {
  [key: string]: {
    x: number;
    y: number;
    status: PointStatus
  };
}
