import {Injectable} from '@angular/core';
import {HelperService} from './helper.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {GameService} from './game.service';
import {GameId} from './game.id';
import {PUSHER_APP_KEY} from '../const';

export const EVENT_FIRE = 'client-E1';
export const EVENT_FIRE_RESPONSE = 'client-E2';
export const EVENT_PLAYER_JOINED = 'pusher:member_added';
export const EVENT_PLAYER_SUBSCRIBED = 'pusher:subscription_succeeded';
export const EVENT_ENEMY_FIRE = EVENT_FIRE;
export const EVENT_ENEMY_LOOSE = 'client-E5';
export const EVENT_LOOSE = EVENT_ENEMY_LOOSE;
export const EVENT_ENEMY_PLACED = 'client-E6';

export type EventTypes = typeof EVENT_FIRE
  | typeof EVENT_FIRE_RESPONSE
  | typeof EVENT_PLAYER_JOINED
  | typeof EVENT_ENEMY_FIRE
  | typeof EVENT_ENEMY_LOOSE
  | typeof EVENT_ENEMY_PLACED
  | typeof EVENT_PLAYER_SUBSCRIBED;

declare const Pusher: any;

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private pusherChannel: any;
  private subscriptions = {};

  subscribe(event: EventTypes, callBack): SubscribeEvent {

    if (!this.subscriptions[event]) {
      this.pusherChannel.bind(event, (data) => {
        Object.values(this.subscriptions[event].callBacks).forEach((cb: any) => cb(data));
      });
    }

    this.subscriptions[event] = this.subscriptions[event] || {callBacks: {}};

    const uniqId = HelperService.uniqId();
    this.subscriptions[event].callBacks[uniqId] = callBack;

    return {
      unsubscribe: () => {
        delete this.subscriptions[event].callBacks[uniqId];
      }
    };
  }

  emit(event: EventTypes, data?: object | null) {
    data = data || null;
    this.pusherChannel.trigger(event, data);
  }

  constructor(private gameIdService: GameId) {
  }

  initPusher() {
    const pusher = new Pusher(PUSHER_APP_KEY, {
      authEndpoint: 'http://localhost:3000/pusher/auth',
      cluster: 'eu',
    });

    this.pusherChannel = pusher.subscribe('presence-' + this.gameIdService.id);

  }
}
