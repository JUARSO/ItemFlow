import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MorePage } from './more.page';
import { ReportsPage } from './reports/reports.page';
import { ThemesPage } from './themes/themes.page';

const routes: Routes = [
  { path: '', component: MorePage },
  { path: 'reports', component: ReportsPage },
  { path: 'themes', component: ThemesPage }
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MorePage, ReportsPage, ThemesPage]
})
export class MorePageModule {}
