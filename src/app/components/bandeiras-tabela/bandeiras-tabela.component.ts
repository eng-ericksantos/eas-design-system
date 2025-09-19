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
    tagTop: 0,     // topo (âncora) da TAG = topo do contorno (positivo)
    tagLeft: 0,
    tagWidth: 0,   // largura da TAG (vai igualar à largura TOTAL do contorno)
  };

  /** Nada de headroom no topo: 0 (evita espaço fantasma) */
  tagHeadroom = 0;

  private readonly TOP_OFFSET = 0; // ajuste fino do topo do contorno vs header (0 = alinhado)

  ngAfterViewInit(): void { setTimeout(() => this.reflowOverlay()); }

  setNivelAtual(i: number) {
    if (i >= 0 && i <= 3) { this.nivelAtual = i; this.reflowOverlay(); }
  }

  @HostListener('window:resize') onResize() { this.reflowOverlay(); }
  @HostListener('window:orientationchange') onOrient() { this.reflowOverlay(); }

  /**
   * - Contorno começa no topo do primeiro header;
   * - TAG é ancorada nesse topo e o CSS a eleva com translateY(-100%);
   * - Largura da TAG = largura TOTAL do contorno (inclui as bordas) para alinhar borda-a-borda.
   */
  reflowOverlay() {
    const heads = this.levelHeads?.toArray();
    const rows = this.headerRows?.toArray();
    if (!heads?.length || !rows?.length) return;

    const container = this.scrollArea.nativeElement;
    const cRect = container.getBoundingClientRect();

    // Coluna atual pela célula “Nível X”
    const hRect = heads[this.nivelAtual].nativeElement.getBoundingClientRect();
    let left = hRect.left - cRect.left + container.scrollLeft;
    let width = hRect.width;

    // Não extrapola container
    left = Math.max(0, Math.min(left, container.clientWidth - width));
    width = Math.min(width, container.clientWidth - left);

    // Topo do primeiro header relativo ao container
    const headerTop = rows[0].nativeElement.getBoundingClientRect().top - cRect.top;

    // 1) Contorno começa no header
    const top = Math.max(0, Math.round(headerTop + this.TOP_OFFSET));

    // 2) Altura do contorno até a última linha
    const lastRow = this.tableRoot.nativeElement
      .querySelector('.group:last-of-type .grid:last-of-type') as HTMLElement | null;
    const lastBottom = lastRow
      ? lastRow.getBoundingClientRect().bottom - cRect.top
      : container.scrollHeight;
    const height = Math.max(0, Math.round(lastBottom - top));

    // 3) TAG: mesma largura TOTAL do contorno (alinhada com as bordas)
    //    (como a tag usa box-sizing: border-box, a largura informada já considera o padding)
    // const tagWidth = Math.max(0, width);

    // 4) TAG colada ao topo do contorno (o CSS sobe -100%)
    const tagTop = top;

    const center = left + width / 2;
    const tagLeft = Math.round(left);
    const tagWidth = Math.round(width);


    this.overlay = {
      left: Math.floor(left),
      width: Math.floor(width),
      center,
      top,
      height,
      tagTop,
      tagLeft,
      tagWidth,
    };
  }
}
