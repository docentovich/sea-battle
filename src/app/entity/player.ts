import {Board} from './board';
import {EVENT_ENEMY_FIRE, EVENT_ENEMY_LOOSE, EVENT_LOOSE} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Subscription} from 'rxjs';

export const PLAYER_STATUS_PLAYING = 'PL1';
export const PLAYER_STATUS_WIN = 'PL2';
export const PLAYER_STATUS_LOOSE = 'PL3';
export const PLAYER_STATUS_PLACING = 'PL4';
export const PLAYER_STATUS_PENDING = 'PL5';

export class Player {
  private gameId: number;
  private id: number;
  private playerMyBoard: Board;
  private shipsSubscriber: Subscription;
  private playerEnemyBoard: Board;
  private subscription: SubscribeEvent;
  private subscriptionLoose: SubscribeEvent;
  private status: typeof PLAYER_STATUS_PLAYING | typeof PLAYER_STATUS_WIN | typeof PLAYER_STATUS_LOOSE
    | typeof PLAYER_STATUS_PLACING | typeof PLAYER_STATUS_PENDING;

  get canMove() {
    return this.status === PLAYER_STATUS_PLAYING;
  }

  get myBoard() {
    return this.playerMyBoard;
  }

  get enemyBoard() {
    return this.playerEnemyBoard;
  }

  fire(x, y) {
    this.enemyBoard.fire(x, y);
    this.status = PLAYER_STATUS_PENDING;
  }

  constructor(private $events, myBoard: Board, enemyBoard: Board) {
    this.status = PLAYER_STATUS_PLACING;
    this.playerMyBoard = myBoard;
    this.playerEnemyBoard = enemyBoard;
    this.subscribeOnFire();
    this.subscribeOnEnemyLoose();
  }

  private subscribeOnEnemyLoose() {
    this.subscriptionLoose = this.$events.subscribe(EVENT_ENEMY_LOOSE, () => {
      this.subscriptionLoose.unsubscribe();
      console.log('win');
      this.status = PLAYER_STATUS_WIN;
    });
  }

  private subscribeOnFire() {
    this.subscription = this.$events.subscribe(EVENT_ENEMY_FIRE, (coords) => {
      this.status = PLAYER_STATUS_PLAYING;
    });

    this.shipsSubscriber = this.myBoard.ships$.subscribe(ships => {
      if (ships.length === 0) {
        this.status = PLAYER_STATUS_LOOSE;
        this.$events.emit(EVENT_LOOSE);
      }
    });
  }

  __destruct() {
    this.subscription.unsubscribe();
    this.subscriptionLoose.unsubscribe();
    this.shipsSubscriber.unsubscribe();
    this.myBoard.__destruct();
    this.enemyBoard.__destruct();
  }
}
