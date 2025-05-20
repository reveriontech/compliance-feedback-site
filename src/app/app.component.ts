import { Component, HostListener } from '@angular/core';
import { ConfigService } from 'ejflab-front-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    public configSrv: ConfigService,
  ) {
    this.configSrv.setCookie('noglang', 'es', 365);
    document.cookie = 'yo=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey) {
      switch (event.code) {
        case 'KeyI':
          break;
        case 'KeyQ':
          break;
        case 'KeyB':
          break;
        case 'Comma':
          break;
        case 'Period':
          break;
        case 'Enter':
          break;
        case 'Backquote':
          //El pipe | arriba a la izquierda
          break;
        case 'NumpadEnter':
          break;
        default:
          console.log(event.code);
      }
    }
  }
}
