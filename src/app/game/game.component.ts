import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PENDING, GAME_STATUS_PLACING, GameService} from '../services/game.service';
import {EVENT_MEMBERS_CHANGED, EventsService} from '../services/events.service';

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
    private events: EventsService
  ) {
  }

  ngOnInit() {
    this.game.id = this.activatedRoute.snapshot.params['id'];

    const subscription = this.events.subscribe(EVENT_MEMBERS_CHANGED, (members) => {
      if (members.length === 2) {
        return;
      }
      this.game.player.myBoard.refreshBoard();
      this.game.player.enemyBoard.refreshBoard();
      this.game.status = GAME_STATUS_PENDING;
      subscription.unsubscribe();
      this.router.navigate(['/game', this.game.id]);
    });

    if (this.game.status === GAME_STATUS_PENDING) {
      this.router.navigate(['/share', this.game.id]);
      return;
    }
    this.game.placeShips();
  }

}
