import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DataService } from './data.service';
import { ModelComparison, DemandPrediction, PredictionVsActual, PredictionExplanation, SaleRecord, OutlierResult } from '../models';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private retraining = false;
  private retrainingProgress = 0;

  constructor(private data: DataService) {}

  getModelComparisons(): Observable<ModelComparison[]> {
    return of(this.data.modelComparisons).pipe(delay(400));
  }

  getModelComparison(productId: string): Observable<ModelComparison | undefined> {
    return of(this.data.modelComparisons.find(m => m.productId === productId)).pipe(delay(300));
  }

  getDemandPredictions(productId: string, days = 30): Observable<DemandPrediction[]> {
    return of(this.data.demandPredictions.filter(p => p.productId === productId).slice(0, days)).pipe(delay(500));
  }

  getPredictionVsActual(productId: string): Observable<PredictionVsActual[]> {
    return of(this.data.predictionVsActual).pipe(delay(400));
  }

  getPredictionExplanations(productId: string): Observable<PredictionExplanation[]> {
    return of(this.data.predictionExplanations).pipe(delay(300));
  }

  detectOutliers(productId: string): Observable<OutlierResult> {
    const records = this.data.saleRecords.filter(r => r.productId === productId);
    const product = this.data.products.find(p => p.id === productId);
    const outliers = records.filter(r => r.isOutlier);

    return of({
      productId, productName: product?.name || '',
      totalRecords: records.length,
      outliersFound: outliers.length,
      method: 'Z-Score' as const,
      records
    }).pipe(delay(800));
  }

  triggerRetraining(productId: string): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: `Reentrenamiento programado para producto ${productId}. Estará listo en 2-5 minutos.` }).pipe(delay(1500));
  }

  getOverallAccuracy(): { avgR2: number; avgMSE: number; bestModel: string } {
    const comps = this.data.modelComparisons;
    const avgR2 = comps.reduce((sum, c) => {
      const m = c.selectedModel === 'decision_tree' ? c.decisionTree : c.linearRegression;
      return sum + m.r2;
    }, 0) / comps.length;
    const avgMSE = comps.reduce((sum, c) => {
      const m = c.selectedModel === 'decision_tree' ? c.decisionTree : c.linearRegression;
      return sum + m.mse;
    }, 0) / comps.length;

    const dtCount = comps.filter(c => c.selectedModel === 'decision_tree').length;
    const bestModel = dtCount >= comps.length / 2 ? 'Árbol de Decisión' : 'Regresión Lineal';

    return { avgR2: Math.round(avgR2 * 1000) / 1000, avgMSE: Math.round(avgMSE * 10) / 10, bestModel };
  }

  getSaleRecords(productId: string): SaleRecord[] {
    return this.data.saleRecords.filter(r => r.productId === productId);
  }

  generateSvgLinePath(values: number[], width: number, height: number): string {
    if (!values.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 4;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return 'M ' + pts.join(' L ');
  }

  generateSvgAreaPath(values: number[], width: number, height: number): string {
    const line = this.generateSvgLinePath(values, width, height);
    return `${line} L ${width},${height} L 0,${height} Z`;
  }
}
