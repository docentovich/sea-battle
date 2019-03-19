import {Injectable} from '@angular/core';
import {HelperService} from './helper.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';

export const EVENT_FIRE = 'E1';
export const EVENT_FIRE_RESPONSE = 'E2';
export const EVENT_PLAYER_JOINED = 'E3';
export const EVENT_ENEMY_FIRE = EVENT_FIRE;
export const EVENT_ENEMY_LOOSE = 'E5';
export const EVENT_LOOSE = EVENT_ENEMY_LOOSE;

export type EventTypes = typeof EVENT_FIRE |  typeof EVENT_FIRE_RESPONSE
  | typeof EVENT_PLAYER_JOINED | typeof EVENT_ENEMY_FIRE | typeof EVENT_ENEMY_LOOSE;

@Injectable({
    providedIn: 'root'
})
export class EventsService {

    private subscriptions: {};

    subscribe(event: EventTypes, callBack): SubscribeEvent {
        this.subscriptions[event] = this.subscriptions[event] || {};

        const uniqId = this.helper.uniqId();
        this.subscriptions[event][uniqId] = {
            callBack,
        };

        return {
            unsubscribe: () => {
                delete this.subscriptions[event][uniqId];
            }
        };
    }

    emit(event: EventTypes, data?: object | null) {
        return Promise.resolve(data); // todo emitter
    }

    constructor(private helper: HelperService) {
    }
}
