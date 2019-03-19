import {EventsService} from '../services/events.service';
import {Point, POINT_STATUS_BURNED, POINT_STATUS_DAMAGE, PointStatus} from './point';
import {PointsFlatList} from '../interfaces/points.flat.list';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';
import {HelperService} from '../services/helper.service';
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

  getPointBy(point: Point) {
    this.getPoint(point.x, point.y);
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

  offsetPoints(): PointsStatusFlatList {
    let pointsMap: PointsStatusFlatList = {};

    Object.values(this.shipPointsFlatList).forEach(point => {
      const x = point.x;
      const y = point.y;
      pointsMap[`${x}_${y}`] = {
        x, y, status: POINT_STATUS_DAMAGE
      };
      pointsMap = this.burnAroundPoint(point.x, point.y, pointsMap);
    });

    return pointsMap;
  }

  burnAroundPoint(x, y, pointsMap) {
    pointsMap = HelperService.pointsBeside(x, y)
      .map((coords) => this.burnPoint(x, y, pointsMap));

    return pointsMap;
  }

  burnPoint(x, y, pointsMap) {
    if (x < 0 || y < 0 || x > BOARD_WIDTH || y > BOARD_HEIGHT) {
      return pointsMap;
    }

    if (!pointsMap[`${x}_${y}`]) {
      pointsMap[`${x}_${y}`] = {
        x, y, status: POINT_STATUS_BURNED
      };
    }
    return pointsMap;
  }
}
