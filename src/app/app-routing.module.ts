import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AppComponent} from './app.component';
import {GameComponent} from './game/game.component';
import {MultiplayerComponent} from './multiplayer/multiplayer.component';
import {HelperService} from './services/helper.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'share/' + HelperService.uniqId()
  },
  {
    path: 'share/:id',
    component: MultiplayerComponent
  },
  {
    path: 'game/:id',
    component: GameComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
