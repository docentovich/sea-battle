import {
  Point,
  POINT_STATUS_CAN_PLACE,
  POINT_STATUS_EMPTY,
  POINT_STATUS_PLACED,
} from './point';
import {EVENT_ENEMY_FIRE, EVENT_FIRE, EVENT_FIRE_RESPONSE, EVENT_TOOGLE_TURN, EventsService} from '../services/events.service';
import {Ship} from './ship';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Subject} from 'rxjs';
import {Helper} from '../helper';
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

  private getPointBy(point: { x, y }): Point {
    return this.getPoint(point.x, point.y);
  }

  getPoint(x: number, y: number): Point {
    return this.pointsFlatList[`${x}_${y}`];
  }

  private setPoint(point: Point) {
    this.pointsFlatList[`${point.x}_${point.y}`] = point;
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

  startPlacing() {
    this.status = BOARD_STATUS_PLACING;
    this.revertCanPlaceToBeside();
    this.canPlaceAllEmpty();
  }

  placePoint(x, y) {
    if (this.status !== BOARD_STATUS_PLACING) {
      throw Error();
    }
    this.dropCanPlace();
    this.getPoint(x, y).setPlaced();

    this.getPlacedPoints()
      .forEach((point: Point) => {

        Helper.pointsBesideLine(point.x, point.y)
          .forEach(coords => {
            if (this.getPointBy(coords).status === POINT_STATUS_EMPTY) {
              this.getPointBy(coords).setPlacement();
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


  get rows() {
    return this.boardRows;
  }

  refreshBoard() {
    if (this.isMyBoard) {
      this.status = BOARD_STATUS_PLACING;
    }
    this.fillBoard(this.width, this.height);
  }

  private fillBoard(width, height) {
    this.boardRows = [];
    this.pointsFlatList = {};

    for (let y = 1; y <= height; y++) {
      const points = [];
      for (let x = 1; x <= width; x++) {
        const point = new Point(x, y);
        this.setPoint(point);
        points.push(point);
      }
      this.boardRows.push(points);
    }
  }

  constructor(private $events: EventsService, width: number, height: number, isMyBoard = true) {
    this.width = width;
    this.height = height;
    this.isMyBoard = isMyBoard;
  }

  init() {
    this.refreshBoard();
  }

  /**
   * Fire to enemy board
   *
   * @param x
   * @param y
   */
  fire(x, y) {
    if (this.isMyBoard) {
      return;
    }

    const point: Point = this.getPoint(x, y);

    const subscription = this.$events.subscribe(EVENT_FIRE_RESPONSE,
      (result: null | { pointsTransfer: PointsStatusFlatList, hit: boolean }) => {
        subscription.unsubscribe();

        Object.values(result.pointsTransfer).forEach(pointExport => {
          this.getPointBy(pointExport).injectStatus(pointExport.status);
        });

        if (!result.hit) {
          this.$events.emit(EVENT_TOOGLE_TURN);
        }

      });

    this.$events.emit(EVENT_FIRE, {x: point.x, y: point.y});
  }

  /**
   * Enemy fire
   */
  private subscribeOnFire() {
    this.subscription = this.$events.subscribe(EVENT_ENEMY_FIRE, (coords) => {
      const ship = this.ships.find((curShip: Ship) => curShip.enemyFire(coords.x, coords.y));

      if (!ship) {
        this.$events.emit(EVENT_TOOGLE_TURN);
      }

      ship ? this.getPointBy(coords).damagePoint()
        : this.getPointBy(coords).burnPoint();

      this.$events.emit(EVENT_FIRE_RESPONSE, {
        pointsTransfer: (ship && ship.length === 0)
          ? this.killTheShip(ship)
          : this.getPointBy(coords).exportFlatListed(),
        hit: !!ship
      });

      this.ships = this.ships.filter((curShip) => curShip.length !== 0);
      this.ships$.next(this.ships);

    });
  }

  /** ===== HELPERS point filtered getters ==== **/

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

  /** ===== HELPERS functions point batch statuses changing ==== **/

  private dropCanPlace() {
    this.getCanPlacePoints().forEach(point => point.setEmpty());
  }

  private revertCanPlaceToBeside() {
    this.getCanPlacePoints().forEach(point => point.setPlacedBeside());
  }

  private canPlaceAllEmpty() {
    this.getFreePoints().forEach((point: Point) => point.setPlacement());
  }

  /** === ship sink functions */

  killTheShip(ship): PointsStatusFlatList {
    let pointsMap: PointsStatusFlatList = {};

    Object.values(ship.getPoints()).forEach((point: Point) => {
      point.damagePoint();
      pointsMap[point.pointKey()] = point.export();
      pointsMap = this.burnAroundShipPoint(point, pointsMap);
    });

    return pointsMap;
  }

  burnAroundShipPoint(point, pointsMap) {
    Helper.pointsBeside(point.x, point.y)
      .map((coords) => {
        point = this.getPointBy(coords);
        point.burnPoint();
        pointsMap[point.pointKey()] = point.export();
      });

    return pointsMap;
  }


  __destruct() {
    delete this.pointsFlatList;
    delete this.boardRows;
    delete this.ships;
    delete this.ships$;
    this.subscription && this.subscription.unsubscribe();
  }
}
