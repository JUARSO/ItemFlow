import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { PredictionService } from '../../core/services/prediction.service';
import { DataService } from '../../core/services/data.service';
import { OutlierResult, SaleRecord, Product } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-dataset', templateUrl: './dataset.page.html', styleUrls: ['./dataset.page.scss'] })
export class DatasetPage implements OnInit {
  products: Product[] = [];
  selectedProductId = 'p01';
  outlierResult: OutlierResult | null = null;
  records: SaleRecord[] = [];
  loading = false;
  detectingOutliers = false;
  normalizing = false;
  showImportSim = false;
  importProgress = 0;
  importStatus = '';
  segment = 'overview';

  constructor(private predictionService: PredictionService, private data: DataService,
    private toastCtrl: ToastController, private loadingCtrl: LoadingController) {}

  ngOnInit() {
    this.products = this.data.products;
    this.loadRecords();
  }

  loadRecords() {
    this.records = this.predictionService.getSaleRecords(this.selectedProductId);
  }

  onProductChange(ev: any) { this.selectedProductId = ev.detail.value; this.loadRecords(); this.outlierResult = null; }

  async detectOutliers() {
    this.detectingOutliers = true;
    const loading = await this.loadingCtrl.create({ message: 'Analizando datos... (IQR + Z-Score)', spinner: 'crescent' });
    await loading.present();

    this.predictionService.detectOutliers(this.selectedProductId).subscribe(async result => {
      await loading.dismiss();
      this.outlierResult = result;
      this.detectingOutliers = false;
      const toast = await this.toastCtrl.create({
        message: `Análisis completo: ${result.outliersFound} valores atípicos detectados de ${result.totalRecords} registros`,
        duration: 3500, color: result.outliersFound > 0 ? 'warning' : 'success', position: 'top'
      });
      await toast.present();
    });
  }

  async normalizeDataset() {
    this.normalizing = true;
    const loading = await this.loadingCtrl.create({ message: 'Normalizando dataset...', spinner: 'crescent' });
    await loading.present();
    setTimeout(async () => {
      await loading.dismiss();
      this.normalizing = false;
      const toast = await this.toastCtrl.create({ message: 'Dataset normalizado: escalado Min-Max aplicado, variables categóricas codificadas.', duration: 3500, color: 'success', position: 'top' });
      await toast.present();
    }, 1800);
  }

  async simulateImport() {
    this.showImportSim = true;
    this.importProgress = 0;
    this.importStatus = 'Validando estructura del archivo...';
    await this.delay(600);
    this.importProgress = 25;
    this.importStatus = 'Validando columnas obligatorias (fecha, SKU, cantidad, precio)...';
    await this.delay(700);
    this.importProgress = 55;
    this.importStatus = 'Procesando 365 registros...';
    await this.delay(800);
    this.importProgress = 80;
    this.importStatus = 'Detectando valores atípicos...';
    await this.delay(600);
    this.importProgress = 100;
    this.importStatus = '✓ Importación completa: 365 registros procesados, 18 outliers marcados';
    const toast = await this.toastCtrl.create({ message: 'Datos importados exitosamente', duration: 2500, color: 'success', position: 'top' });
    await toast.present();
  }

  discardOutlier(record: SaleRecord) {
    record.isOutlier = false;
    const idx = this.data.saleRecords.findIndex(r => r.id === record.id);
    if (idx !== -1) this.data.saleRecords[idx].isOutlier = false;
    if (this.outlierResult) this.outlierResult.outliersFound = Math.max(0, this.outlierResult.outliersFound - 1);
  }

  get outlierCount() { return this.records.filter(r => r.isOutlier).length; }
  get outlierRecords() { return (this.outlierResult?.records || []).filter(r => r.isOutlier); }
  get cleanRecords() { return (this.outlierResult?.records || []).filter(r => !r.isOutlier).slice(0, 5); }

  normTechniques = [
    { icon: 'resize-outline', color: '#2563EB', name: 'Escalado Min-Max', desc: 'Normaliza valores numéricos al rango [0,1] preservando la distribución original' },
    { icon: 'code-slash-outline', color: '#7C3AED', name: 'Codificación One-Hot', desc: 'Convierte variables categóricas (categoría, día de la semana) en variables binarias' },
    { icon: 'bandage-outline', color: '#D97706', name: 'Imputación de valores faltantes', desc: 'Rellena datos ausentes usando la mediana del producto para el período' }
  ];

  private delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}
