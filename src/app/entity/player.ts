import {Board} from './board';

export const STATUS_PLAYING: 'PL1';
export const STATUS_WIN: 'PL2';
export const STATUS_LOOSE: 'PL3';
export const STATUS_PLACING: 'PL4';
export const STATUS_PENDING: 'PL5';

export class Player {
    private gameId: number;
    private id: number;
    private myBoard: Board;
    private enemyBoard: Board;
    private canMove: false;
    private status: typeof STATUS_PLAYING | typeof STATUS_WIN | typeof STATUS_LOOSE | typeof STATUS_PLACING | typeof STATUS_PENDING;
    fire(x, y) {
        this.enemyBoard.getPoint(x,y).fier();
    }
}
