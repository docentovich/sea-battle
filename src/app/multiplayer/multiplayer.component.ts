import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PLACING, GAME_STATUS_PLAYING, GameService} from '../services/game.service';
import {EVENT_FIRE, EVENT_MEMBERS_CHANGED, EVENT_PLAYER_JOINED, EVENT_PLAYER_SUBSCRIBED, EventsService} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit, OnDestroy {
  subscription: SubscribeEvent;
  subscriptionJoined: SubscribeEvent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public game: GameService,
    private events: EventsService
  ) {
  }

  ngOnInit() {
    this.game.connect( this.activatedRoute.snapshot.params['id'] );

    this.subscriptionJoined = this.events.subscribe(EVENT_PLAYER_JOINED, () => {
      this.game.player.setIsMyTurn();
    });

    this.subscription = this.events.subscribe(EVENT_MEMBERS_CHANGED, (members) => {
      if (members.length !== 2) {
        return;
      }
      this.game.status = GAME_STATUS_PLACING;
      this.router.navigate(['/game', this.game.id]);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionJoined.unsubscribe();
  }

}
