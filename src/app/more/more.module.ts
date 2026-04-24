import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MorePage } from './more.page';
import { ProductsPage } from './products/products.page';
import { DatasetPage } from './dataset/dataset.page';
import { UsersPage } from './users/users.page';
import { ReportsPage } from './reports/reports.page';

const routes: Routes = [
  { path: '', component: MorePage },
  { path: 'products', component: ProductsPage },
  { path: 'dataset', component: DatasetPage },
  { path: 'users', component: UsersPage },
  { path: 'reports', component: ReportsPage }
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [MorePage, ProductsPage, DatasetPage, UsersPage, ReportsPage]
})
export class MorePageModule {}
