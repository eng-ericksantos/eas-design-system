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

  selectedBrand = {
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

  /** Geometria do contorno e da tag */
  overlay = {
    left: 0,
    width: 0,
    center: 0,
    top: 0,
    height: 0,
    tagTop: 0,     // topo da TAG (fora do contorno; valor negativo em relação ao contorno)
    tagWidth: 0,   // largura da TAG = largura interna do contorno (entre as bordas)
  };

  /**
   * NÃO usamos mais “headroom” (spacer) no topo da `.scroll` — deixamos 0 para
   * não criar espaço em branco. A tag está FORA do contorno, então não cobre o header.
   */
  tagHeadroom = 0;

  // Constantes para ajuste fino
  private readonly BORDER = 2;     // espessura da borda do contorno (CSS)
  private readonly OUT_GAP = 2;    // distância visual da TAG até a borda do contorno (fora)
  private readonly TOP_OFFSET = 0; // ajuste fino do topo do contorno vs. header (0 fica alinhado)

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

  /**
   * Lógica simples e confiável:
   * - O contorno começa exatamente na altura do primeiro header (sem “gap”).
   * - A TAG fica FORA do contorno, colada ao topo (com OUT_GAP).
   * - A largura da TAG é a largura INTERNA do contorno (entre as duas bordas).
   */
  reflowOverlay() {
    const heads = this.levelHeads?.toArray();
    const rows = this.headerRows?.toArray();
    if (!heads?.length || !rows?.length) return;

    const container = this.scrollArea.nativeElement;
    const cRect = container.getBoundingClientRect();

    // Coluna atual (usa o header “Nível X” como referência)
    const hRect = heads[this.nivelAtual].nativeElement.getBoundingClientRect();
    let left = hRect.left - cRect.left + container.scrollLeft;
    let width = hRect.width;

    // Clamps laterais
    left = Math.max(0, Math.min(left, container.clientWidth - width));
    width = Math.min(width, container.clientWidth - left);

    // Topo do primeiro header relativo ao container
    const headerTop = rows[0].nativeElement.getBoundingClientRect().top - cRect.top;

    // 1) Contorno: começa no topo do header (opcionalmente deslocado por TOP_OFFSET)
    const top = Math.max(0, Math.round(headerTop + this.TOP_OFFSET));

    // 2) Base do contorno = fim da última linha
    const lastRow = this.tableRoot.nativeElement
      .querySelector('.group:last-of-type .grid:last-of-type') as HTMLElement | null;
    const lastBottom = lastRow
      ? lastRow.getBoundingClientRect().bottom - cRect.top
      : container.scrollHeight;
    const height = Math.max(0, Math.round(lastBottom - top));

    // 3) Largura interna da coluna (entre as bordas) = largura da TAG
    const tagWidth = Math.max(0, width - 2 * this.BORDER);

    // 4) Posição da TAG por fora do contorno (um pouco acima do topo)
    const tagH = this.tagRef?.nativeElement?.offsetHeight || 24;
    const tagTop = top - (tagH + this.OUT_GAP);

    const center = left + width / 2;

    // aplica
    this.overlay = {
      left: Math.floor(left),
      width: Math.floor(width),
      center,
      top,
      height,
      tagTop,
      tagWidth
    };
  }
}
