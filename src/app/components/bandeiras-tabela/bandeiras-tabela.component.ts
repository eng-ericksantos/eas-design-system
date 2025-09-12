import { AfterViewInit, Component, ElementRef, HostListener, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';

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

  overlay = { left: 0, width: 0, top: 0, height: 0, center: 0, tagTop: 0 };

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

    // >>> cria uma "faixa" de respiro acima dos títulos dos níveis
    const headerRect = this.headerRow.nativeElement.getBoundingClientRect();
    const headroom = 24; // espaçamento para a tag (Figma ~22–24px)
    const top = headerRect.top - cRect.top - headroom;

    // até o fim da última linha
    const lastRow = this.tableRoot.nativeElement
      .querySelector('.group:last-of-type .grid:last-of-type') as HTMLElement;
    const lastBottom = lastRow.getBoundingClientRect().bottom - cRect.top;
    const height = (lastBottom - top) + 6;

    // (opcional) deixa o contorno 1px mais "justo" à coluna
    left = left + 1;
    width = Math.max(0, width - 2);

    // *** AQUI está a alteração pedida: TAG colada no topo do contorno ***
    const TAG_OFFSET = 2;                 // 1–3px, ajuste fino
    const tagTop = top + TAG_OFFSET;      // fica dentro e coladinha no topo

    this.overlay = {
      left,
      width,
      top,
      height,
      center: left + width / 2,
      tagTop,                              // usa a variável calculada acima
    };
  }
}
