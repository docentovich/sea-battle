import {
  Point,
  POINT_STATUS_BURNED,
  POINT_STATUS_CAN_PLACE,
  POINT_STATUS_DAMAGE,
  POINT_STATUS_EMPTY,
  POINT_STATUS_PLACED,
  PointStatus
} from './point';
import {EVENT_ENEMY_FIRE, EVENT_FIRE_RESPONSE, EventsService} from '../services/events.service';
import {Ship} from './ship';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Subject} from 'rxjs';
import {HelperService} from '../services/helper.service';
import {PointsFlatList} from '../interfaces/points.flat.list';

export const BOARD_STATUS_PLAYING = 'B1';
export const BOARD_STATUS_PLACING = 'B2';

export class Board {
  private width: number;
  private height: number;
  private boardRows: Array<Array<Point>> = [];
  private pointsFlatList: PointsFlatList = {};
  private ships: Array<Ship> = [];
  private subscription: SubscribeEvent;
  private isMyBoard;
  public ships$: Subject<Array<Ship>> = new Subject<Array<Ship>>();
  private status;

  private getPointBy(point: Point | { x, y }): Point {
    return this.getPoint(point.x, point.y);
  }

  private getPoint(x: number, y: number): Point {
    return this.pointsFlatList[`${x}_${y}`];
  }

  private setPoint(point: Point) {
    this.pointsFlatList[`${point.x}_${point.y}`] = point;
  }

  private changePointStatus(x: number, y: number, status: PointStatus) {
    this.pointsFlatList[`${x}_${y}`].status = status;
  }

  changePointStatusBy(point: Point | { x: number, y: number }, status: PointStatus) {
    this.pointsFlatList[`${point.x}_${point.y}`].status = status;
  }

  private getFreePoints(): Array<Point> {
    return Object.values(this.pointsFlatList)
      .filter((point: Point) => point.status === POINT_STATUS_EMPTY);
  }

  private getCanPlacePoints(): Array<Point> {
    return Object.values(this.pointsFlatList)
      .filter((point: Point) => point.status === POINT_STATUS_CAN_PLACE);
  }

  getPlacedPoints(): Array<Point> {
    return Object.values(this.pointsFlatList)
      .filter((point: Point) => point.status === POINT_STATUS_PLACED);
  }

  getFlatPlacedObject() {
    return this.getPlacedPoints()
      .reduce((flatObject, point) => {
        flatObject[`${point.x}_${point.y}`] = point;
        return flatObject;
      }, {});
  }

  isPlacing() {
    return this.status === BOARD_STATUS_PLACING;
  }

  isPlaying() {
    return this.status === BOARD_STATUS_PLAYING;
  }

  placeShip(ship: Ship) {
    this.ships.push(ship);
    this.ships$.next(this.ships);
  }

  batchPlaceShips(ships: Array<Ship>) {
    this.ships = ships;
    this.ships$.next(this.ships);
  }

  startPlacing() {
    this.status = BOARD_STATUS_PLACING;
    this.dropCanPlace();
    this.getFreePoints()
      .forEach((point: Point) => point.status = POINT_STATUS_CAN_PLACE);
  }

  placePoint(x, y) {
    if (this.status !== BOARD_STATUS_PLACING) {
      throw Error();
    }
    this.dropCanPlace();
    this.changePointStatus(x, y, POINT_STATUS_PLACED);

    this.getPlacedPoints()
      .forEach((point: Point) => {

        HelperService.pointsBesideLine(point.x, point.y)
          .forEach(coords => {
            if (this.getPointBy(coords).status === POINT_STATUS_EMPTY) {
              this.changePointStatusBy(coords, POINT_STATUS_CAN_PLACE);
            }
          });

      });
  }

  stopPlacing() {
    this.status = BOARD_STATUS_PLAYING;
    this.dropCanPlace();
    if (this.isMyBoard) {
      this.subscribeOnFire();
    }
  }

  private dropCanPlace() {
    this.getCanPlacePoints()
      .forEach(point => this.changePointStatusBy(point, POINT_STATUS_EMPTY));
  }

  get rows() {
    return this.boardRows;
  }

  refreshBoard() {
    this.fillBoard(this.$events, this.width, this.height);
  }

  private fillBoard($events, width, height) {
    const rows = [];

    for (let y = 0; y <= height; y++) {
      const points = [];
      for (let x = 0; x < width; x++) {
        const point = new Point($events, x, y);
        this.setPoint(point);
        points.push(point);
      }
      rows.push(points);
    }

    return rows;
  }

  constructor(private $events: EventsService, width: number, height: number, isMyBoard = true) {
    this.width = width;
    this.height = height;
    this.boardRows = this.fillBoard($events, width, height);
    this.isMyBoard = isMyBoard;
  }

  fire(x, y) {
    if (this.isMyBoard) {
      return;
    }
    if (this.status === BOARD_STATUS_PLACING) {
      throw Error();
    }
    const point: Point = this.getPoint(x, y);

    const subscription = this.$events.subscribe(EVENT_FIRE_RESPONSE,
      (pointsTransfer: null | PointsStatusFlatList) => {
        subscription.unsubscribe();

        Object.keys(pointsTransfer).forEach(key => {
          const locPoint = pointsTransfer[key];
          this.changePointStatus(locPoint.x, locPoint.y, locPoint.status);
        });

      });

    point.fire();
  }

  private subscribeOnFire() {
    this.subscription = this.$events.subscribe(EVENT_ENEMY_FIRE, (coords) => {
      try {

        const ship = this.ships.find((curShip: Ship) => curShip.enemyFire(coords.x, coords.y));
        this.changePointStatus(
          coords.x,
          coords.y,
          ship ? POINT_STATUS_DAMAGE : POINT_STATUS_BURNED
        );

        this.$events.emit(EVENT_FIRE_RESPONSE, {
          pointsTransfer: (ship && ship.length === 0) ? ship.offsetPoints() : this.getPointBy(coords).export(),
        });

        this.ships = this.ships.filter((curShip) => curShip.length !== 0);
        this.ships$.next(this.ships);

      } catch (e) {
        console.log(e);
      }
    });
  }

  __destruct() {
    this.subscription.unsubscribe();
  }
}
