import {Injectable, OnInit} from '@angular/core';
import {Player} from '../entity/player';
import {Board} from '../entity/board';
import {EVENT_ENEMY_PLACED, EVENT_PLAYER_JOINED, EventsService} from './events.service';
import {Point} from '../entity/point';
import {GameId} from './game.id';
import {BOARD_HEIGHT, BOARD_WIDTH} from '../const';

export const GAME_STATUS_PENDING = 'G1';
export const GAME_STATUS_PLAYING = 'G2';
export const GAME_STATUS_PLACING = 'G3';

export type GameStatuses = typeof GAME_STATUS_PENDING | typeof GAME_STATUS_PLAYING | typeof GAME_STATUS_PLACING;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameStatus: GameStatuses;
  public player: Player;
  private enemyReady = false;

  get status() {
    return this.gameStatus;
  }

  set status(newStatus) {
    this.gameStatus = newStatus;
  }

  get id() {
    return this.gameIdService.id;
  }

  set id(value) {
    this.gameIdService.id = value;
  }

  get isPlacing() {
    return this.status === GAME_STATUS_PLACING;
  }

  get isPlayng() {
    return this.status === GAME_STATUS_PLAYING;
  }

  get link() {
    const port = location.port ? ':' + location.port : '';
    return `${location.protocol}//${location.hostname}${port}/share/${this.id}`;
  }

  constructor(private $events: EventsService, private gameIdService: GameId) {

  }

  private subscribeOnChangeGameStatus() {
    const subscription = this.$events.subscribe(EVENT_ENEMY_PLACED, () => {
      this.enemyReady = true;
      this.tryStartGame();
      subscription.unsubscribe();
    });
  }

  initGame() {
    this.gameStatus = GAME_STATUS_PENDING;
    this.player = new Player(
      this.$events,
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT, true),
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT, false),
    );
    this.subscribeOnChangeGameStatus();
  }

  placeShips() {
    if (this.gameStatus !== GAME_STATUS_PLACING) {
      return;
    }
    return this.player.placeShips()
      .then(() => {
        this.tryStartGame();
      });
  }

  private tryStartGame() {
    if (this.enemyReady && !this.player.myBoard.isPlacing()) {
      this.gameStatus = GAME_STATUS_PLAYING;
    }
  }


  clickPoint(point: Point) {
    if (this.player.myBoard.isPlacing() && point.canPlace) {
      this.player.place(point);
      return;
    } else if (!this.player.myBoard.isPlaying() && point.canFire) {
      this.player.fire(point);
    }
  }

}
