import {Point, POINT_STATUS_BURNED, POINT_STATUS_DAMAGE, PointStatus} from './point';
import {EVENT_ENEMY_FIRE, EVENT_FIRE_RESPONSE, EVENT_ENEMY_LOOSE, EventsService, EVENT_FIRE, EVENT_LOOSE} from '../services/events.service';
import {Ship} from './ship';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Observer, Subject} from 'rxjs';

export class Board {
  private width: number;
  private height: number;
  private boardRows: Array<Array<Point>>;
  private pointsFlatList: object;
  private ships: Array<Ship>;
  private subscription: SubscribeEvent;
  private isMyBoard;
  public ships$: Subject<Array<Ship>>;

  getPointBy(point: Point): Point {
    return this.getPoint(point.x, point.y);
  }

  getPoint(x: number, y: number): Point {
    return this.pointsFlatList[`${x}_${y}`];
  }

  setPoint(point: Point) {
    this.pointsFlatList[`${point.x}_${point.y}`] = point;
  }

  changePointStatus(x: number, y: number, status: PointStatus) {
    this.pointsFlatList[`${x}_${y}`].status = status;
  }

  changePointStatusBy(point: Point, status: PointStatus) {
    this.pointsFlatList[`${point.x}_${point.y}`].status = status;
  }

  get rows() {
    return this.boardRows;
  }

  private fillBoard($events, width, height) {
    const rows = [];

    for (let y = 1; y++; y <= height) {
      const points = [];
      for (let x = 1; x++; x < width) {
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
    if (isMyBoard) {
      this.subscribeOnFire();
    }
  }

  fire(x, y) {
    if (this.isMyBoard) {
      return;
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
