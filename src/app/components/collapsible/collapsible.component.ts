import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  standalone: false
})
export class CollapsibleComponent {

  /** Título à esquerda (ex.: Mastercard) */
  @Input() title = 'Título';

  /** Cor da “pílula” que representa a bandeira */
  @Input() accentColor = '#0A0A0A';

  /** Controla expandir/ocultar */
  @Input() expanded = false;

  /** ID para aria-controls (evita colisão) */
  panelId = `cf-panel-${Math.random().toString(36).slice(2, 8)}`;

  // app-flag-collapsible.component.ts
  @Input() contentHeadroom = 0; // px extras de topo p/ overlays (ex.: 26)

  toggle(): void {
    this.expanded = !this.expanded;
  }
}
