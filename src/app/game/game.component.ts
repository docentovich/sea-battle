import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PENDING, GameService} from '../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  get player() {
    return this.game.player;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public game: GameService,
  ) {
  }

  ngOnInit() {
    if (this.game.status === GAME_STATUS_PENDING) {
      this.router.navigate(['/']);
      return;
    }
    this.game.placeShips();
  }

}
