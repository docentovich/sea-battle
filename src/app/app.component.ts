import {Component, OnInit} from '@angular/core';
import {HelperService} from './services/helper.service';
import {Router} from '@angular/router';
import {GameId} from './services/game.id';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
