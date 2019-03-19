import {Injectable} from '@angular/core';
import {HelperService} from './helper.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {GameService} from './game.service';
import {GameId} from './game.id';

export const EVENT_FIRE = 'E1';
export const EVENT_FIRE_RESPONSE = 'E2';
export const EVENT_PLAYER_JOINED = 'subscription_succeeded';
export const EVENT_ENEMY_FIRE = EVENT_FIRE;
export const EVENT_ENEMY_LOOSE = 'E5';
export const EVENT_LOOSE = EVENT_ENEMY_LOOSE;
export const EVENT_ENEMY_PLACED = 'E6';

export type EventTypes = typeof EVENT_FIRE | typeof EVENT_FIRE_RESPONSE
  | typeof EVENT_PLAYER_JOINED | typeof EVENT_ENEMY_FIRE | typeof EVENT_ENEMY_LOOSE | typeof EVENT_ENEMY_PLACED;

declare const Pusher: any;

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private pusherChannel: any;
  private subscriptions = {};

  subscribe(event: EventTypes, callBack): SubscribeEvent {
    this.subscriptions[event] = this.subscriptions[event] || {
      bind: this.pusherChannel.bind(`pusher:${event}`, function (data) {
        Object.values(this.callBacks).forEach((cb: (data) => void) => {
          cb(data);
        });
      }),
      callBacks: {}
    };


    const uniqId = HelperService.uniqId();
    this.subscriptions[event].callBacks[uniqId] = {
      callBack,
    };

    return {
      unsubscribe: () => {
        delete this.subscriptions[event].callBacks[uniqId];
      }
    };
  }

  emit(event: EventTypes, data?: object | null) {
    data = data || null;
    this.pusherChannel.trigger(`client-pusher:${event}`, data);
  }

  constructor(private gameIdService: GameId) {
  }

  initPusher() {
    const pusher = new Pusher('050830562651109a4451', {
      authEndpoint: '/pusher/auth',
      cluster: 'eu'
    });

    this.pusherChannel = pusher.subscribe(this.gameIdService.id);

    this.pusherChannel.bind('pusher:subscription_succeeded', members => {
    });
  }
}
