import {Injectable} from '@angular/core';
import {Helper} from '../helper';
import {SubscribeEvent} from '../interfaces/subscribe.event';
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
export const EVENT_PLACED = EVENT_ENEMY_PLACED;
export const EVENT_MEMBERS_CHANGED = 'members-changed';

export type EventTypes = typeof EVENT_FIRE
  | typeof EVENT_FIRE_RESPONSE
  | typeof EVENT_PLAYER_JOINED
  | typeof EVENT_ENEMY_FIRE
  | typeof EVENT_ENEMY_LOOSE
  | typeof EVENT_ENEMY_PLACED
  | typeof EVENT_PLAYER_SUBSCRIBED
  | typeof EVENT_MEMBERS_CHANGED;

declare const Pusher: any;

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private pusherChannel: any;
  private subscriptions = {
    [EVENT_MEMBERS_CHANGED]: {callBacks: {}}
  };
  private members = [];

  subscribe(event: EventTypes, callBack): SubscribeEvent {

    if (!this.subscriptions[event]) {
      this.pusherChannel.bind(event, (data) => {
        Object.values(this.subscriptions[event].callBacks).forEach((cb: any) => cb(data));
      });
    }

    this.subscriptions[event] = this.subscriptions[event] || {callBacks: {}};

    const uniqId = Helper.uniqId();
    this.subscriptions[event].callBacks[uniqId] = callBack;

    return {
      unsubscribe: () => {
        delete this.subscriptions[event].callBacks[uniqId];
      }
    };
  }

  emit(event: EventTypes, data?: object | null) {
    data = data || {};
    this.pusherChannel.trigger(event, data);
  }

  constructor(private gameIdService: GameId) {
  }

  init( id ) {
    const port = location.port ? ':' + location.port : '';

    const pusher = new Pusher(PUSHER_APP_KEY, {
      authEndpoint: `${location.protocol}//${location.hostname}${port}/pusher/auth`,
      cluster: 'eu',
    });

    this.pusherChannel = pusher.subscribe('presence-' + id);

    this.pusherChannel.bind('pusher:member_added', member => {
      this.members.push(member.id);
      this.membersChanged();
    });
    this.pusherChannel.bind('pusher:subscription_succeeded', members => {
      this.members = Object.keys( members.members );
      this.membersChanged();
    });
    this.pusherChannel.bind('pusher:member_removed', (member: any) => {
      this.members = this.members.filter(mbmr => mbmr !== member.id);
      this.membersChanged();
    });

  }

  membersChanged() {
    Object.values(this.subscriptions[EVENT_MEMBERS_CHANGED].callBacks)
      .forEach((cb: any) => cb(this.members));
  }
}
