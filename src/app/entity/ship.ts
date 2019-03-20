import {EventsService} from '../services/events.service';
import {Point, POINT_STATUS_BURNED, POINT_STATUS_DAMAGE, PointStatus} from './point';
import {PointsFlatList} from '../interfaces/points.flat.list';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';
import {Helper} from '../helper';
import {BOARD_HEIGHT, BOARD_WIDTH} from '../const';

export const SHIP_STATUS_ALIVE = 'S1';
export const SHIP_STATUS_DED = 'S2';

export class Ship {
  private shipPointsFlatList: PointsFlatList = {};
  private shipLength: number;
  private status: typeof SHIP_STATUS_ALIVE | typeof SHIP_STATUS_DED;

  get length() {
    return this.shipLength;
  }

  getPoint(x: number, y: number): Point {
    return this.shipPointsFlatList[`${x}_${y}`];
  }

  constructor($events: EventsService, length: number, shipPointsFlatList: PointsFlatList) {
    this.status = SHIP_STATUS_ALIVE;
    this.shipLength = length;
    this.shipPointsFlatList = shipPointsFlatList;
  }

  enemyFire(x, y): boolean {
    if (!this.getPoint(x, y)) {
      return false;
    }

    if (this.getPoint(x, y).status === POINT_STATUS_DAMAGE) {
      throw Error('you can not shoot here');
    }

    this.getPoint(x, y).damagePoint();
    this.shipLength--;

    return true;
  }

  getPoints(): PointsFlatList {
    return this.shipPointsFlatList;
  }
}
