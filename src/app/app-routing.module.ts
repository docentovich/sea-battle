import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MultiplayerComponent} from './multiplayer/multiplayer.component';

const routes: Routes = [
    {
        path: '',
        component: MultiplayerComponent
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
