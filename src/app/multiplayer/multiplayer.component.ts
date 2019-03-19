import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PLACING, GAME_STATUS_PLAYING, GameService} from '../services/game.service';
import {EVENT_FIRE, EVENT_PLAYER_JOINED, EventsService} from '../services/events.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public game: GameService,
    private events: EventsService
  ) {
  }

  ngOnInit() {
    this.game.id = this.activatedRoute.snapshot.params['id'];
    this.events.initPusher();
    this.game.initGame();

    const subscription = this.events.subscribe(EVENT_PLAYER_JOINED, () => {
      this.game.status = GAME_STATUS_PLACING;
      subscription.unsubscribe();
      this.router.navigate(['/game', this.game.id]);
    });
  }
}
