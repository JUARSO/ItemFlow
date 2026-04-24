import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'catalog', loadChildren: () => import('../catalog/catalog.module').then(m => m.CatalogPageModule) },
      { path: 'inventory', loadChildren: () => import('../inventory/inventory.module').then(m => m.InventoryPageModule) },
      { path: 'predictions', loadChildren: () => import('../predictions/predictions.module').then(m => m.PredictionsPageModule) },
      { path: 'projection', loadChildren: () => import('../predictions/projection/projection.module').then(m => m.ProjectionPageModule) },
      { path: 'alerts', loadChildren: () => import('../alerts/alerts.module').then(m => m.AlertsPageModule) },
      { path: 'more', loadChildren: () => import('../more/more.module').then(m => m.MorePageModule) },
      { path: '', redirectTo: 'catalog', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
