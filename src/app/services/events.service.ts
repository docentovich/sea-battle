import {Injectable} from '@angular/core';

export const EVENT_FIRE = 'E1';
export const EVENT_FIRE_RESPONSE = 'E2';

export type EventTypes = typeof EVENT_FIRE |  typeof EVENT_FIRE_RESPONSE;

@Injectable({
    providedIn: 'root'
})
export class EventsService {

    private subsciptions: {};

    subscribe(event: EventTypes, callBack) {
        this.subsciptions[event] = this.subsciptions[event] || {};

        const uniqId = this.uniqId();
        this.subsciptions[event][uniqId] = {
            callBack,
        };

        return {
            unsubscribe: () => {
                delete this.subsciptions[event][uniqId];
            }
        };
    }

    emit(event: EventTypes, data: object | null) {
        return Promise.resolve(data); // todo emitter
    }

    constructor() {
    }


    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private uniqId() {
        const ts = (new Date).toString();
        const parts = ts.split('').reverse();
        let id = '';

        for (let i = 0; i < 8; ++i) {
            const index = this.getRandomInt(0, parts.length - 1);
            id += parts[index];
        }

        return id;
    }
}
