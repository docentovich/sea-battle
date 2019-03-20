import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PENDING, GAME_STATUS_PLACING, GameService} from '../services/game.service';
import {EVENT_MEMBERS_CHANGED, EventsService} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';
import {Point} from '../entity/point';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  subscription: SubscribeEvent;

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
    this.game.connect(this.activatedRoute.snapshot.params['id']);

    this.subscription = this.events.subscribe(EVENT_MEMBERS_CHANGED, (members) => {
      if (members.length !== 2) {
        this.router.navigate(['/share', this.game.id]);
      }
    });

    if (this.game.status === GAME_STATUS_PENDING) {
      this.router.navigate(['/share', this.game.id]);
      return;
    }

    this.game.init();
    this.game.placeShips();
  }


  clickPoint(point: Point) {
    if (this.game.player.myBoard.isPlacing() && point.canPlace) {
      this.game.player.place(point);
      return;
    } else if (this.game.player.myBoard.isPlaying() && point.canFire && this.player.isMyTurn) {
      this.game.player.fire(point);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.game.restartGame();
  }

}
