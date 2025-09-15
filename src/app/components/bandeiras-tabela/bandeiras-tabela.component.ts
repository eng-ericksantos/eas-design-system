import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';

interface Taxa {
  metodo: string;
  niveis: string[]; // sempre 4 posições
}
interface Grupo {
  titulo: string;
  taxas: Taxa[];
}
interface Bandeira {
  nome: string;
  bandeira: string;
  grupos: Grupo[];
}

@Component({
  selector: 'app-bandeiras-tabela',
  templateUrl: './bandeiras-tabela.component.html',
  styleUrls: ['./bandeiras-tabela.component.scss'],
  standalone: false
})
export class BandeirasTabelaComponent implements AfterViewInit {

  @ViewChild('tagRef') tagRef!: ElementRef<HTMLDivElement>;

  @Input() embedded = false;
  @HostBinding('class.embedded') get isEmbedded() { return this.embedded; }

  @ViewChild('tableRoot', { static: true }) tableRoot!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollArea', { static: true }) scrollArea!: ElementRef<HTMLDivElement>;
  @ViewChild('headerRow', { static: false }) headerRow!: ElementRef<HTMLElement>;
  @ViewChildren('levelHead') levelHeads!: QueryList<ElementRef<HTMLElement>>;

  nivelAtual = 0;

  selectedBrand: Bandeira = {
    nome: 'Mastercard',
    bandeira: 'mastercard',
    grupos: [
      {
        titulo: 'Maquininha',
        taxas: [
          { metodo: 'Débito', niveis: ['1,10%', '1,05%', '0,98%', '0,89%'] },
          { metodo: 'Crédito à vista', niveis: ['3,10%', '3,05%', '2,98%', '2,89%'] },
          { metodo: 'Parcelado 2-6', niveis: ['3,53%', '3,48%', '3,41%', '3,32%'] },
          { metodo: 'Parcelado acima de 7', niveis: ['4,61%', '4,56%', '4,49%', '4,40%'] },
        ],
      },
      {
        titulo: 'Online',
        taxas: [
          { metodo: 'Débito', niveis: ['1,70%', '1,65%', '1,58%', '1,49%'] },
          { metodo: 'Crédito à vista', niveis: ['3,70%', '3,65%', '3,58%', '3,49%'] },
          { metodo: 'Parcelado 2-6', niveis: ['4,13%', '4,08%', '4,01%', '3,92%'] },
          { metodo: 'Parcelado acima de 7', niveis: ['5,21%', '5,16%', '5,09%', '5,00%'] },
        ],
      },
    ],
  };

  overlay = {
    left: 0,
    width: 0,
    center: 0,
    top: 0,
    height: 0,
    tagTop: 0,
    tagMaxWidth: 0,   // 👈 novo
  };

  tagHeadroom = 26;
  private readonly MIN_HEADROOM = 26;
  private readonly TAG_TOP_OFFSET = 2;

  ngAfterViewInit(): void {
    setTimeout(() => this.reflowOverlay());
  }

  setNivelAtual(i: number) {
    if (i >= 0 && i <= 3) {
      this.nivelAtual = i;
      this.reflowOverlay();
    }
  }

  @HostListener('window:resize') onResize() { this.reflowOverlay(); }
  @HostListener('window:orientationchange') onOrient() { this.reflowOverlay(); }

  reflowOverlay() {
    const heads = this.levelHeads?.toArray();
    if (!heads || !heads[this.nivelAtual]) return;

    const container = this.scrollArea.nativeElement;
    const cRect = container.getBoundingClientRect();

    // coluna atual (usa o título "Nível X" como referência)
    const hRect = heads[this.nivelAtual].nativeElement.getBoundingClientRect();
    let left = hRect.left - cRect.left + container.scrollLeft;  // <- let
    let width = hRect.width;                                     // <- let

    const styles = getComputedStyle(container);
    const cssHeadroom = parseInt(styles.getPropertyValue('--headroom')) || 26;

    // >>> cria uma "faixa" de respiro acima dos títulos dos níveis
    const headerRect = this.headerRow.nativeElement.getBoundingClientRect();
    const rawTop = headerRect.top - cRect.top - cssHeadroom;
    const top = Math.max(6, rawTop); // nunca sai do container

    // até o fim da última linha
    const lastRow = this.tableRoot.nativeElement
      .querySelector('.group:last-of-type .grid:last-of-type') as HTMLElement;
    const lastBottom = lastRow.getBoundingClientRect().bottom - cRect.top;
    const height = (lastBottom - top) + 6;

    // (opcional) deixa o contorno 1px mais "justo" à coluna
    left = left + 1;
    width = Math.max(0, width - 2);

    const BORDER = 2;          // .current-col border-width
    const INSET = 8;          // espaço interno da tag até a borda superior
    const MIN_TAG_W = 72;      // largura mínima da tag
    const MAX_TAG_W = 160;     // teto para telas grandes

    const tagTop = BORDER + INSET;
    const innerWidth = Math.max(0, width - BORDER * 2 - INSET * 2);
    const tagMaxWidth = Math.min(Math.max(MIN_TAG_W, innerWidth), MAX_TAG_W);

    this.overlay = {
      left,
      width,
      center: left + width / 2,
      top,
      height,
      tagTop,
      tagMaxWidth
    };

    setTimeout(() => this.adjustHeadroomForTag(), 0);
  }

  private adjustHeadroomForTag(): void {
    const el = this.tagRef?.nativeElement;
    if (!el) return;
    const needed = el.scrollHeight + 8;       // altura real da tag (1 ou 2 linhas) + folga
    const next = Math.max(this.MIN_HEADROOM, needed);
    if (Math.abs(next - this.tagHeadroom) >= 1) {
      this.tagHeadroom = next;                // isso atualiza [style.--headroom.px]
      this.reflowOverlay();                   // recalcula topo do contorno com o novo headroom
    }
  }
}
