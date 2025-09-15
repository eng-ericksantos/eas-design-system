import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BandeirasTabelaComponent } from '../../components/bandeiras-tabela/bandeiras-tabela.component';
import { HomeComponent } from './home.component';
import { CollapsibleComponent } from '../../components/collapsible/collapsible.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    BandeirasTabelaComponent,
    CollapsibleComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
})
export class HomeModule { }
