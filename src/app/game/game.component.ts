import {Component, OnInit} from '@angular/core';
import {EventsService} from '../services/events.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BOARD_HEIGHT, BOARD_WIDTH, GAME_STATUS_PLAYING, GameService} from '../services/game.service';
import {Player} from '../entity/player';
import {Board} from '../entity/board';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public player: Player;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public game: GameService,
    private $events: EventsService
  ) {
  }

  ngOnInit() {
    if (this.game.status !== GAME_STATUS_PLAYING) {
      this.router.navigate(['/']);
      return;
    }
    this.initPlayer();
    this.placeShips();
  }

  private initPlayer() {
    this.player = new Player(
      this.$events,
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT),
      new Board(this.$events, BOARD_WIDTH, BOARD_HEIGHT, false),
    );
  }

  private placeShips() {

  }
}
