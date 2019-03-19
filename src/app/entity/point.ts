import {EVENT_FIRE, EVENT_FIRE_RESPONSE, EventsService} from '../services/events.service';

export const POINT_STATUS_EMPTY = 'P1';
export const POINT_STATUS_PLACED = 'P2';
export const POINT_STATUS_BURNED = 'P3';
export const POINT_STATUS_DAMAGE = 'P4';
export const POINT_STATUS_PENDING = 'P5';
export const POINT_STATUS_PLACED_BESIDE = 'P6';
export const POINT_STATUS_CAN_PLACE = 'P7';

export type PointStatus = typeof POINT_STATUS_EMPTY | typeof POINT_STATUS_PLACED | typeof POINT_STATUS_PLACED_BESIDE
  | typeof POINT_STATUS_BURNED | typeof POINT_STATUS_DAMAGE | typeof POINT_STATUS_CAN_PLACE;

export class Point {
  private pX: number;
  private pY: number;
  private pointStatus: PointStatus;

  get canPlace() {
    return this.status === POINT_STATUS_CAN_PLACE;
  }

  get canFire() {
    return this.status !== POINT_STATUS_BURNED && this.status !== POINT_STATUS_DAMAGE;
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

  constructor(private $events: EventsService, x: number, y: number) {
    this.pX = x;
    this.pY = y;
    this.status = POINT_STATUS_EMPTY;
  }

  setEventsService($events: EventsService) {
    this.$events = $events;
  }

  fire() {
    const subscription = this.$events.subscribe(EVENT_FIRE_RESPONSE, (newStatus) => {
      this.status = newStatus;
      subscription.unsubscribe();
    });

    this.$events.emit(EVENT_FIRE, {x: this.pX, y: this.pY});
  }

  export() {
    return {
      x: this.x,
      y: this.y,
      status: this.status
    };
  }
}
