import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  uniqId() {
    return Math.random().toString(36).substr(2, 8)
  }
}
