import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GameComponent} from './game/game.component';
import {MultiplayerComponent} from './multiplayer/multiplayer.component';
import {Helper} from './helper';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'share/' + Helper.uniqId()
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
