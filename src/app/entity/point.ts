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
    return this.pointStatus === POINT_STATUS_CAN_PLACE;
  }

  get canFire() {
    return this.pointStatus !== POINT_STATUS_BURNED && this.pointStatus !== POINT_STATUS_DAMAGE;
  }

  get isPlaced() {
    return this.pointStatus === POINT_STATUS_PLACED || this.pointStatus === POINT_STATUS_DAMAGE;
  }

  get isDamage() {
    return this.pointStatus === POINT_STATUS_DAMAGE;
  }

  get isBurned() {
    return this.pointStatus === POINT_STATUS_BURNED;
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

  burnPoint() {
    if (this.pointStatus !== POINT_STATUS_DAMAGE) {
      this.pointStatus = POINT_STATUS_BURNED;
    }
  }

  damagePoint() {
    this.pointStatus = POINT_STATUS_DAMAGE;
  }

  setPlacement() {
    this.pointStatus = POINT_STATUS_CAN_PLACE;
  }

  setEmpty() {
    this.pointStatus = POINT_STATUS_EMPTY;
  }

  setPlaced() {
    this.pointStatus = POINT_STATUS_PLACED;
  }

  injectStatus(status) {
    this.pointStatus = status;
  }

  setPlacedBeside() {
    this.pointStatus = POINT_STATUS_PLACED_BESIDE;
  }

  constructor(x: number, y: number) {
    this.pX = x;
    this.pY = y;
    this.pointStatus = POINT_STATUS_EMPTY;
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
      status: this.pointStatus
    };
  }
}

