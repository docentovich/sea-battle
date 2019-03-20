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
export const GAME_STATUS_OVER = 'G4';

export type GameStatuses = typeof GAME_STATUS_PENDING | typeof GAME_STATUS_PLAYING | typeof GAME_STATUS_PLACING | typeof GAME_STATUS_OVER;

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameStatus: GameStatuses;
  public player: Player;
  private enemyReady = false;


  connect(id: number) {
    if (!!this.gameIdService.id) {
      return;
    }

    this.gameIdService.id = id;
    this.$events.init(id);
  }

  get status() {
    return this.gameStatus;
  }

  set status(newStatus) {
    this.gameStatus = newStatus;
  }

  get id() {
    return this.gameIdService.id;
  }

  get isOver() {
    return this.player.gameIsOver;
  }

  get isWin() {
    return !this.player.gameIsOver && this.player.isWin;
  }

  get isLoose() {
    return !this.player.gameIsOver && this.player.isLoose;
  }

  get isPlacing() {
    return this.status === GAME_STATUS_PLACING;
  }

  get isPlayng() {
    return this.status === GAME_STATUS_PLAYING && !this.player.gameIsOver;
  }

  get link() {
    const port = location.port ? ':' + location.port : '';
    return `${location.protocol}//${location.hostname}${port}/share/${this.id}`;
  }

  constructor(private $events: EventsService, private gameIdService: GameId) {
    this.restartGame();
  }

  restartGame() {
    this.gameStatus = GAME_STATUS_PENDING;
    this.player = new Player(
      this.$events,
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT, true),
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT, false),
    );
  }

  private subscribeOnChangeGameStatus() {
    const subscription = this.$events.subscribe(EVENT_ENEMY_PLACED, () => {
      this.enemyReady = true;
      this.tryStartGame();
      subscription.unsubscribe();
    });
  }

  init() {
    this.player.init();
    this.enemyReady = false;
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

}
