import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  standalone: false
})
export class CollapsibleComponent {

  @Input() title = 'Título';
  @Input() accentColor = '#0A0A0A';
  @Input() expanded = true;
  @Input() contentHeadroom = 0;  // px extras no topo do conteúdo (para a tag)

  panelId = `cf-panel-${Math.random().toString(36).slice(2, 8)}`;
  toggle() { this.expanded = !this.expanded; }
}
