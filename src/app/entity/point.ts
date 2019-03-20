import {EVENT_FIRE, EVENT_FIRE_RESPONSE, EventsService} from '../services/events.service';
import {Helper} from '../helper';
import {PointsStatusFlatList} from '../interfaces/points.statuses.flat.list';

export const POINT_STATUS_EMPTY = 'P1';
export const POINT_STATUS_PLACED = 'P2';
export const POINT_STATUS_BURNED = 'P3';
export const POINT_STATUS_DAMAGE = 'P4';
export const POINT_STATUS_PENDING = 'P5';
export const POINT_STATUS_PLACED_BESIDE = 'P6';
export const POINT_STATUS_CAN_PLACE = 'P7';

export type PointStatus = typeof POINT_STATUS_EMPTY
  | typeof POINT_STATUS_PLACED
  | typeof POINT_STATUS_PLACED_BESIDE
  | typeof POINT_STATUS_BURNED
  | typeof POINT_STATUS_DAMAGE
  | typeof POINT_STATUS_CAN_PLACE;

export class Point {
  private pX: number;
  private pY: number;
  private pointStatus: PointStatus;
  id;

  get canPlace() {
    return this.status === POINT_STATUS_CAN_PLACE;
  }

  canPlaceFn() {
    return this.status === POINT_STATUS_CAN_PLACE;
  }

  get canFire() {
    return this.status !== POINT_STATUS_BURNED && this.status !== POINT_STATUS_DAMAGE;
  }

  get isPlaced() {
    return this.status === POINT_STATUS_PLACED || this.status === POINT_STATUS_DAMAGE;
  }

  get isDamage() {
    return this.status === POINT_STATUS_DAMAGE;
  }

  get isBurned() {
    return this.status === POINT_STATUS_BURNED;
  }

  get x() {
    return this.pX;
  }

  get y() {
    return this.pY;
  }

  get status() {
    return this.pointStatus;
  }

  set status(newStatus: PointStatus) {
    this.pointStatus = newStatus;
  }

  burnPoint() {
    if (this.status !== POINT_STATUS_DAMAGE) {
      this.status = POINT_STATUS_BURNED;
    }
  }

  damagePoint() {
    this.status = POINT_STATUS_DAMAGE;
  }

  constructor(x: number, y: number) {
    this.pX = x;
    this.pY = y;
    this.status = POINT_STATUS_EMPTY;
    this.id = Helper.uniqId();
  }

  exportFlatListed(): any {
    return {
      [this.pointKey()]: this.export()
    };
  }

  pointKey() {
    return `${this.x}_${this.y}`;
  }

  export(): { x: number; y: number; status: PointStatus; } {
    return {
      x: this.x,
      y: this.y,
      status: this.status
    };
  }
}

