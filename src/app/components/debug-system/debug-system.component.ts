import { Component } from '@angular/core';

@Component({
  selector: 'app-debug-system',
  standalone: true,
  templateUrl: './debug-system.component.html',
  styleUrls: ['./debug-system.component.scss'],
})
export class DebugSystemComponent {
  now = new Date();
  ua = navigator.userAgent;
  platform = navigator.platform;
}
