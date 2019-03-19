import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameId {
  private gameId;
  get id() {
    return this.gameId;
  }

  set id(value) {
    if (this.gameId) {
      return;
    }
    this.gameId = value;
  }
}
