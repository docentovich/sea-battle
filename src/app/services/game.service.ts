import {Injectable} from '@angular/core';

export const GAME_STATUS_WAITING = 'G1';
export const GAME_STATUS_PLAYING = 'G2';

export type GameStatuses = typeof GAME_STATUS_WAITING | typeof GAME_STATUS_PLAYING;

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameId: number;
  private gameStatus: GameStatuses;

  get status() {
    return this.gameStatus;
  }

  set status(newStatus) {
    this.gameStatus = newStatus;
  }

  get id() {
    return this.gameId;
  }

  set id(value) {
    if (this.gameId) {
      return;
    }
    this.gameId = value;
  }

  get link() {
    const port = location.port ? ':' + location.port : '';
    return `${location.protocol}//${location.hostname}${port}/share/${this.gameId}`;
  }

  constructor() {
    this.gameStatus = GAME_STATUS_WAITING;
  }
}
