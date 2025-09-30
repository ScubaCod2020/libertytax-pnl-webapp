import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly brandSrc$: Observable<string>;
  readonly watermarkSrc$: Observable<string>;

  constructor(private wizard: WizardStateService) {
    this.brandSrc$ = this.wizard.answers$.pipe(
      map((a) =>
        a.region === 'CA'
          ? '/assets/brands/ca/LT-Canada-Logo-RGB.jpg'
          : '/assets/brands/us/LT-2022-Stack-Color-RGB.png'
      )
    );
    this.watermarkSrc$ = this.wizard.answers$.pipe(
      map((a) =>
        a.region === 'CA'
          ? '/assets/brands/ca/LTCA-Leaf-ISO-Red.jpg'
          : '/assets/brands/us/LT-Torch-CMYK.png'
      )
    );
  }
}
