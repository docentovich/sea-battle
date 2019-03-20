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

  getPointBy(point: {x: number, y: number}) {
    return this.getPoint(point.x, point.y);
  }

  getPoint(x: number, y: number): Point {
    return this.shipPointsFlatList[`${x}_${y}`];
  }

  setPoint(point: Point) {
    this.shipPointsFlatList[`${point.x}_${point.y}`] = point;
  }

  changePointStatus(x: number, y: number, status: PointStatus) {
    this.shipPointsFlatList[`${x}_${y}`].status = status;
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


    this.changePointStatus(x, y, POINT_STATUS_DAMAGE);
    this.shipLength--;

    return true;
  }

  getPoints(): PointsFlatList {
    return this.shipPointsFlatList;
  }
}
