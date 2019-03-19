import {Board} from './board';
import {EVENT_ENEMY_FIRE, EVENT_ENEMY_LOOSE, EVENT_LOOSE} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Subscription} from 'rxjs';
import {Point} from './point';
import {Ship} from './ship';
import {ShipTypes} from '../interfaces/ship.types';
import {SHIPS_TYPES} from '../const';

export const PLAYER_STATUS_PLAYING = 'PL1';
export const PLAYER_STATUS_WIN = 'PL2';
export const PLAYER_STATUS_LOOSE = 'PL3';
export const PLAYER_STATUS_PLACING = 'PL4';
export const PLAYER_STATUS_PENDING = 'PL5';

export class Player {
  private playerMyBoard: Board;
  private shipsSubscriber: Subscription;
  private playerEnemyBoard: Board;
  private subscription: SubscribeEvent;
  private subscriptionLoose: SubscribeEvent;
  private status: typeof PLAYER_STATUS_PLAYING | typeof PLAYER_STATUS_WIN | typeof PLAYER_STATUS_LOOSE
    | typeof PLAYER_STATUS_PLACING | typeof PLAYER_STATUS_PENDING;

  private placingShip: ShipTypes;
  private resolveShip;
  private rejectShip;

  shipTypesToPlace = Object.assign({}, SHIPS_TYPES);

  get canMove(): boolean {
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

  get gameIsOwer() {
    return this.status === PLAYER_STATUS_WIN || this.status === PLAYER_STATUS_LOOSE ;
  }

  get isWin() {
    return this.status === PLAYER_STATUS_WIN;
  }

  get isLoose() {
    return this.status === PLAYER_STATUS_LOOSE;
  }

  fire(point: Point) {
    this.enemyBoard.fire(point.x, point.y);
    this.status = PLAYER_STATUS_PENDING;
  }

  place(point: Point) {
    this.placingShip.leftPoints--;
    this.myBoard.placePoint(point.x, point.y);

    if (this.placingShip.leftPoints === 0) {
      this.resolveShip(
        new Ship(this.$events, this.placingShip.length, this.myBoard.getFlatPlacedObject())
      );
    }

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


  placeShips(): Promise<void> {
    return this.placingShips()
      .then(() => this.myBoard.stopPlacing());
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

  __destruct() {
    this.subscription.unsubscribe();
    this.subscriptionLoose.unsubscribe();
    this.shipsSubscriber.unsubscribe();
    this.myBoard.__destruct();
    this.enemyBoard.__destruct();
  }
}
