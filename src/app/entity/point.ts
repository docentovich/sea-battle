import {EVENT_FIRE, EVENT_FIRE_RESPONSE, EventsService} from '../services/events.service';

export const STATUS_EMPTY = 'P1';
export const STATUS_PLACED = 'P2';
export const STATUS_BURNED = 'P3';
export const STATUS_DAMAGE = 'P4';
export const STATUS_PENDING = 'P5';

export type PointStatus = typeof STATUS_EMPTY |  typeof STATUS_PLACED |  typeof STATUS_BURNED |  typeof STATUS_DAMAGE;

export class Point {
    private pX: number;
    private pY: number;
    private pStatus: PointStatus;
    private $events: EventsService;

    get x() {
        return this.pX;
    }

    get y() {
        return this.pY;
    }

    get status() {
        return this.pStatus;
    }

    set status(newStatus: PointStatus) {
        this.pStatus = newStatus;
    }

    constructor(x: number, y: number) {
        this.pX = x;
        this.pY = y;
        this.status = STATUS_EMPTY;
    }

    setEventsService($events: EventsService) {
        this.$events = $events;
    }

    fire() {
        const subscription = this.$events.subscribe(EVENT_FIRE_RESPONSE, (newStatus) => {
            this.status = newStatus;
            subscription.unsubscribe();
        });

        this.$events.emit(EVENT_FIRE, { x: this.pX, y: this.pY });
    }
}
