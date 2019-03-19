import {Component, OnInit} from '@angular/core';
import {HelperService} from './services/helper.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private helper: HelperService, private router: Router) {
  }

  ngOnInit() {
    this.router.navigate(['/share', { id: this.helper.uniqId() }]);
  }
}
