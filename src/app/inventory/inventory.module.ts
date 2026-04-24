import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { InventoryPage } from './inventory.page';
import { KardexPage } from './kardex/kardex.page';
import { AbcPage } from './abc/abc.page';
import { WarehousesPage } from './warehouses/warehouses.page';

const routes: Routes = [
  { path: '', component: InventoryPage },
  { path: 'kardex', component: KardexPage },
  { path: 'abc', component: AbcPage }
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [InventoryPage, KardexPage, AbcPage, WarehousesPage]
})
export class InventoryPageModule {}
