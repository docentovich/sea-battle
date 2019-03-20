import {BOARD_HEIGHT, BOARD_WIDTH} from './const';

export class Helper {
  static uniqId(): string {
    return Math.random().toString(36).substr(2, 8);
  }

  static pointsBeside(x, y): Array<{x: number, y: number}> {
    return [
      {x: x - 1, y: y - 1},
      {x: x - 1, y},
      {x: x - 1, y: y + 1},
      {x, y: y - 1},
      {x, y: y + 1},
      {x: x + 1, y: y - 1},
      {x: x + 1, y},
      {x: x + 1, y: y + 1},
    ].filter(coords => coords.x > 0 && coords.x <= BOARD_WIDTH && coords.y > 0 && coords.y <= BOARD_HEIGHT);
  }

  static pointsBesideLine(x, y): Array<{x: number, y: number}> {
    return [
      {x: x - 1, y},
      {x, y: y - 1},
      {x, y: y + 1},
      {x: x + 1, y},
    ].filter(coords => coords.x > 0 && coords.x <= BOARD_WIDTH && coords.y > 0 && coords.y <= BOARD_HEIGHT);
  }
}
