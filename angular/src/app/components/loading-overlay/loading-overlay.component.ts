import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  @Input({ required: true }) watermarkSrc!: string;
  @Input({ required: true }) message!: string;
  @Input() subMessage?: string;
}
