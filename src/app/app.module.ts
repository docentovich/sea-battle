import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { MultiplayerComponent } from './multiplayer/multiplayer.component';
import {GameService} from './services/game.service';
import {EventsService} from './services/events.service';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MultiplayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    GameService,
    EventsService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
