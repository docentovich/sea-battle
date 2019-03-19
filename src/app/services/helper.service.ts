
export class HelperService {
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
    ];
  }

  static pointsBesideLine(x, y): Array<{x: number, y: number}> {
    return [
      {x: x - 1, y},
      {x, y: y - 1},
      {x, y: y + 1},
      {x: x + 1, y},
    ];
  }
}
