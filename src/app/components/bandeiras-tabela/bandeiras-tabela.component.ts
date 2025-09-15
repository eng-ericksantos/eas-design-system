import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

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
  standalone: false,
})
export class BandeirasTabelaComponent implements AfterViewInit {
  @Input() embedded = false;
  @HostBinding('class.embedded') get isEmbedded() { return this.embedded; }

  @ViewChild('tableRoot', { static: true }) tableRoot!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollArea', { static: true }) scrollArea!: ElementRef<HTMLDivElement>;
  @ViewChildren('headerRow') headerRows!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('levelHead') levelHeads!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('tagRef') tagRef!: ElementRef<HTMLDivElement>;

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

  /** geometria do overlay */
  overlay = {
    left: 0,
    width: 0,
    center: 0,
    top: 0,
    height: 0,
    tagTop: 0,
    tagMaxWidth: 0,
  };

  /** espaço no topo do .scroll para a TAG (sem sobrepor headers) */
  tagHeadroom = 26;

  private readonly MIN_HEADROOM = 22;  // topo compacto
  private readonly BORDER = 2;         // borda do contorno
  private readonly INSET = 10;        // respiro interno da TAG (⬆ levemente maior p/ não “encostar”)
  private readonly GAP = 6;         // distância entre base da TAG e o header

  ngAfterViewInit(): void {
    // pequena espera para layout estabilizar
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

  /** Calcula contorno e TAG garantindo que NUNCA ultrapassem o container */
  reflowOverlay() {
    const heads = this.levelHeads?.toArray();
    const rows = this.headerRows?.toArray();
    if (!heads?.length || !rows?.length) return;

    const container = this.scrollArea.nativeElement;
    const cRect = container.getBoundingClientRect();

    // 1) Coluna atual (baseada no header "Nível X")
    const hRect = heads[this.nivelAtual].nativeElement.getBoundingClientRect();

    // posição horizontal relativa ao container (considerando scrollLeft)
    let left = hRect.left - cRect.left + container.scrollLeft;
    let width = hRect.width;

    // CLAMP nas laterais do container → nunca estoura
    left = Math.max(0, Math.min(left, container.clientWidth - width));
    width = Math.min(width, container.clientWidth - left);

    // 2) Contorno: topo colado acima do header com headroom calculado
    const firstHeaderRect = rows[0].nativeElement.getBoundingClientRect();
    const headerTop = firstHeaderRect.top - cRect.top;

    // mede a TAG para headroom exato (suporta 1 ou 2 linhas)
    const tagH = this.tagRef?.nativeElement?.offsetHeight || 24;
    const neededHead = Math.ceil(tagH + this.GAP + this.BORDER + this.INSET);
    this.tagHeadroom = Math.max(this.MIN_HEADROOM, neededHead);

    const top = Math.max(0, Math.round(headerTop - this.tagHeadroom));

    // base do contorno = fim da última linha do último grupo
    const lastRow = this.tableRoot.nativeElement
      .querySelector('.group:last-of-type .grid:last-of-type') as HTMLElement | null;
    const lastBottom = lastRow
      ? lastRow.getBoundingClientRect().bottom - cRect.top
      : container.scrollHeight;

    const height = Math.max(0, Math.round(lastBottom - top));

    // 3) TAG: sempre DENTRO da largura útil do contorno
    const innerW = Math.max(0, width - 2 * (this.BORDER + this.INSET));
    const MIN_TAG_W = 72, MAX_TAG_W = 160;
    const tagMaxWidth = Math.min(Math.max(MIN_TAG_W, innerW), MAX_TAG_W);

    // top da TAG: dentro do contorno e acima do header
    const tagTop = top + this.BORDER + this.INSET;

    // centro da TAG com clamp nas laterais do contorno
    const measuredTagW = Math.min(tagMaxWidth, (this.tagRef?.nativeElement?.offsetWidth || tagMaxWidth));
    const half = measuredTagW / 2;
    let center = left + width / 2;
    const minCenter = left + this.BORDER + this.INSET + half;
    const maxCenter = left + width - (this.BORDER + this.INSET) - half;
    center = Math.max(minCenter, Math.min(center, maxCenter));

    // 4) aplica
    this.overlay = { left: Math.floor(left), width: Math.floor(width), center, top, height, tagTop, tagMaxWidth };

    // 5) segunda passagem p/ estabilizar caso a TAG mude (quebra de linha)
    requestAnimationFrame(() => {
      const tagH2 = this.tagRef?.nativeElement?.offsetHeight || tagH;
      const need2 = Math.ceil(tagH2 + this.GAP + this.BORDER + this.INSET);
      const next = Math.max(this.MIN_HEADROOM, need2);
      if (Math.abs(next - this.tagHeadroom) >= 1) {
        this.tagHeadroom = next;
        this.reflowOverlay();
      }
    });
  }
}
