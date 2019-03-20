import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GAME_STATUS_PLACING, GAME_STATUS_PLAYING, GameService} from '../services/game.service';
import {EVENT_FIRE, EVENT_PLAYER_JOINED, EVENT_PLAYER_SUBSCRIBED, EventsService} from '../services/events.service';
import {SubscribeEvent} from '../interfaces/subscribe.event';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit {
  subscriptionJoined: SubscribeEvent;
  subscriptionSubscribed: SubscribeEvent;

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
    let players = 0;

    this.subscriptionJoined = this.events.subscribe(EVENT_PLAYER_JOINED, (data) => {
      players++;
      this.checkPlayersJoined(players);
    });
    this.subscriptionSubscribed = this.events.subscribe(EVENT_PLAYER_SUBSCRIBED, (members) => {
      players = members.count;
      this.checkPlayersJoined(players);
    });
  }

  private checkPlayersJoined(players) {
    if (players !== 2) {
      return;
    }
    this.game.status = GAME_STATUS_PLACING;
    this.subscriptionJoined.unsubscribe();
    this.subscriptionSubscribed.unsubscribe();
    this.router.navigate(['/game', this.game.id]);
  }
}
