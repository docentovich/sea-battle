import {Board} from './board';
import {
  EVENT_ENEMY_LOOSE,
  EVENT_LOOSE,
  EVENT_PLACED,
  EVENT_TOOGLE_TURN
} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Subscription} from 'rxjs';
import {Point} from './point';
import {Ship} from './ship';
import {ShipTypes} from '../interfaces/ship.types';
import {SHIPS_TYPES} from '../const';
import {PointsFlatList} from '../interfaces/points.flat.list';

export const PLAYER_STATUS_PLAYING = 'PL1';
export const PLAYER_STATUS_WIN = 'PL2';
export const PLAYER_STATUS_LOOSE = 'PL3';
export const PLAYER_STATUS_PLACING = 'PL4';
export const PLAYER_STATUS_PENDING = 'PL5';

export class Player {
  private playerMyBoard: Board;
  private shipsSubscriber: Subscription;
  private playerEnemyBoard: Board;
  private subscriptionToogleTurn: SubscribeEvent;
  private subscriptionLoose: SubscribeEvent;
  private status: typeof PLAYER_STATUS_PLAYING
    | typeof PLAYER_STATUS_WIN
    | typeof PLAYER_STATUS_LOOSE
    | typeof PLAYER_STATUS_PLACING
    | typeof PLAYER_STATUS_PENDING;

  private placingShip: ShipTypes;
  private resolveShip;
  private rejectShip;
  private temporaryObjectOfPlacingShip: PointsFlatList = {};
  private shipTypesToPlace = [...SHIPS_TYPES];

  setIsMyTurn() {
    this.status = PLAYER_STATUS_PLAYING;
  }

  toogleTurn() {
    this.status = this.isMyTurn ? PLAYER_STATUS_PENDING : PLAYER_STATUS_PLAYING;
  }

  get isMyTurn() {
    return this.status === PLAYER_STATUS_PLAYING;
  }


  get canPlace(): boolean {
    return this.myBoard.isPlacing();
  }

  get myBoard(): Board {
    return this.playerMyBoard;
  }

  get enemyBoard(): Board {
    return this.playerEnemyBoard;
  }

  get gameIsOver() {
    return this.status === PLAYER_STATUS_WIN || this.status === PLAYER_STATUS_LOOSE;
  }

  get isWin() {
    return this.status === PLAYER_STATUS_WIN;
  }

  get isLoose() {
    return this.status === PLAYER_STATUS_LOOSE;
  }

  fire(point: Point) {
    this.enemyBoard.fire(point.x, point.y);
  }

  constructor(private $events, myBoard: Board, enemyBoard: Board) {
    this.status = PLAYER_STATUS_PLACING;
    this.playerMyBoard = myBoard;
    this.playerEnemyBoard = enemyBoard;
  }

  init() {
    this.temporaryObjectOfPlacingShip = {};
    this.myBoard.init();
    this.enemyBoard.init();
    this.subscribeOnFire();
    this.subscribeOnEnemyLoose();
    this.subscribeOnToogleTurn();
  }

  private subscribeOnEnemyLoose() {
    this.subscriptionLoose = this.$events.subscribe(EVENT_ENEMY_LOOSE, () => {
      this.subscriptionLoose.unsubscribe();
      alert('win');
      this.status = PLAYER_STATUS_WIN;
    });
  }

  private subscribeOnToogleTurn() {
    this.subscriptionToogleTurn = this.$events.subscribe(EVENT_TOOGLE_TURN, () => this.toogleTurn());
  }

  private subscribeOnFire() {
    this.shipsSubscriber = this.myBoard.ships$.subscribe(ships => {
      if (ships.length > 0) {
        return;
      }

      this.status = PLAYER_STATUS_LOOSE;
      this.$events.emit(EVENT_LOOSE);
    });
  }

  /** === place === */
  placeShips(): Promise<void> {
    return this.placingShips()
      .then(() => {
        this.myBoard.stopPlacing();
        this.$events.emit(EVENT_PLACED);
      });
  }

  private placingShips() {
    const shipType = this.shipTypesToPlace.shift();

    return this.placeShip(shipType)
      .then((ship: Ship) => {
        if (!ship) {
          return;
        }
        this.myBoard.placeShip(ship);
        return this.placingShips();
      });
  }

  private placeShip(shipType: ShipTypes | null): Promise<Ship | null> {

    if (!shipType) {
      return Promise.resolve(null);
    }

    this.myBoard.startPlacing();
    this.placingShip = shipType;
    this.placingShip.leftPoints = shipType.length;

    return new Promise((resolve, reject) => {
      this.resolveShip = resolve;
      this.rejectShip = reject;
    });
  }

  placePoint(point: Point) {
    this.placingShip.leftPoints--;
    this.myBoard.placePoint(point.x, point.y);
    this.temporaryObjectOfPlacingShip[point.pointKey()] = point;

    if (this.placingShip.leftPoints === 0) {
      this.resolveShip(
        new Ship(this.$events, this.placingShip.length, this.temporaryObjectOfPlacingShip)
      );

      this.temporaryObjectOfPlacingShip = {};
    }
  }

  __destruct() {
    this.subscriptionToogleTurn && this.subscriptionToogleTurn.unsubscribe();
    this.subscriptionToogleTurn && this.subscriptionLoose.unsubscribe();
    this.shipsSubscriber && this.shipsSubscriber.unsubscribe();
    this.myBoard.__destruct();
    this.enemyBoard.__destruct();
  }
}
