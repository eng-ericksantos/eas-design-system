/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BandeirasTabelaComponent } from './bandeiras-tabela.component';

describe('BandeirasTabelaComponent', () => {
  let component: BandeirasTabelaComponent;
  let fixture: ComponentFixture<BandeirasTabelaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BandeirasTabelaComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandeirasTabelaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
