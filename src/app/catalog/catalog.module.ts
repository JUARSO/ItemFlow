import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CatalogPage } from './catalog.page';

const routes: Routes = [{ path: '', component: CatalogPage }];

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
  declarations: [CatalogPage]
})
export class CatalogPageModule {}
