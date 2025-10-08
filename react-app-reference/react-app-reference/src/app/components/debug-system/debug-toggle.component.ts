// debug-toggle.component.ts - Toggle button for debug system
// Angular equivalent of React DebugToggle component

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="show"
      (click)="onToggle()"
      [style]="getButtonStyle()"
      [title]="isOpen ? 'Close Support Panel' : 'Open Support Panel'"
    >
      <span *ngIf="isOpen" style="color: white; font-size: 18px; font-weight: bold;">✕</span>
      <img 
        *ngIf="!isOpen"
        [src]="getSupportIcon()"
        [alt]="region + ' Support Agent'"
        [style]="getIconStyle()"
        (load)="onIconLoad()"
        (error)="onIconError()"
      />
    </button>
  `,
  styles: [`
    button {
      position: fixed;
      bottom: 12px;
      right: 12px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      z-index: 10000;
      padding: 8px;
    }
  `]
})
export class DebugToggleComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() show: boolean = true;
  @Input() region: 'US' | 'CA' = 'US';
  @Output() toggle = new EventEmitter<void>();

  ngOnInit(): void {
    // Test if support icon files exist
    this.testIconFile();
  }

  onToggle(): void {
    this.toggle.emit();
  }

  getButtonStyle(): any {
    return {
      background: this.isOpen ? '#f59e0b' : '#374151'
    };
  }

  getSupportIcon(): string {
    // Use placeholder icons for now - in production these would be actual asset paths
    return this.region === 'CA' 
      ? '/assets/icons/cdn_support_agent.png'
      : '/assets/icons/us_support_agent.png';
  }

  getIconStyle(): any {
    return {
      width: '28px',
      height: '28px',
      'object-fit': 'contain',
      filter: 'brightness(0) invert(1)' // Make icon white
    };
  }

  onIconLoad(): void {
    console.log(`✅ ${this.region} icon file exists and loaded`);
  }

  onIconError(): void {
    console.error(`❌ ${this.region} icon file NOT found or failed to load`);
  }

  private testIconFile(): void {
    const img = new Image();
    img.onload = () => console.log(`✅ ${this.region} icon file exists and loaded`);
    img.onerror = () => console.error(`❌ ${this.region} icon file NOT found or failed to load`);
    img.src = this.getSupportIcon();
  }
}
