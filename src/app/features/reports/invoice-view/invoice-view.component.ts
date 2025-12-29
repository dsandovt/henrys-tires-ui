import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReportsService } from '../../../core/services/reports.service';
import { Invoice } from '../../../core/models/report.models';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, FileText, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ FileText })
    }
  ],
  template: `
    <div class="invoice-view">
      <div class="header">
        <h1>Invoice</h1>
        <app-button variant="danger" (click)="downloadPdf()" [disabled]="loading()">
          <lucide-icon name="file-text" [size]="16"></lucide-icon>
          Download PDF
        </app-button>
      </div>

      <app-card *ngIf="!loading() && invoice()">
        <div class="invoice-content">
          <!-- Company Header -->
          <div class="company-header" *ngIf="invoice()?.companyInfo as companyInfo">
            <h2>{{ companyInfo.legalName }}</h2>
            <p *ngIf="companyInfo.tradeName">{{ companyInfo.tradeName }}</p>
            <p>{{ companyInfo.addressLine1 }}</p>
            <p>{{ companyInfo.cityStateZip }}</p>
            <p>{{ companyInfo.phone }}</p>
          </div>

          <hr>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="details-row">
              <div>
                <h3>INVOICE</h3>
                <p><strong>Invoice #:</strong> {{ invoice()?.invoiceNumber }}</p>
                <p><strong>Date:</strong> {{ invoice()?.invoiceDateUtc | date:'short' }}</p>
                <p><strong>Branch:</strong> {{ invoice()?.branchCode }} - {{ invoice()?.branchName }}</p>
                <p><strong>Payment Method:</strong> {{ invoice()?.paymentMethod }}</p>
              </div>
              <div class="bill-to">
                <h4>BILL TO</h4>
                <p *ngIf="invoice()?.customerName">{{ invoice()?.customerName }}</p>
                <p *ngIf="invoice()?.customerNumber"><strong>Customer #:</strong> {{ invoice()?.customerNumber }}</p>
                <p *ngIf="invoice()?.customerPhone"><strong>Phone:</strong> {{ invoice()?.customerPhone }}</p>
                <p *ngIf="invoice()?.poNumber"><strong>PO #:</strong> {{ invoice()?.poNumber }}</p>
                <p *ngIf="invoice()?.serviceRep"><strong>Service Rep:</strong> {{ invoice()?.serviceRep }}</p>
              </div>
            </div>
          </div>

          <hr>

          <!-- Line Items -->
          <div class="line-items">
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Condition</th>
                  <th class="number">Qty</th>
                  <th class="number">Unit Price</th>
                  <th class="number">Total</th>
                  <th class="center">Taxable</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let line of invoice()?.lines">
                  <td>{{ line.itemCode }}</td>
                  <td>{{ line.description }}</td>
                  <td>{{ line.condition || '-' }}</td>
                  <td class="number">{{ line.quantity }}</td>
                  <td class="number">{{ line.currency }} {{ line.unitPrice | number:'1.2-2' }}</td>
                  <td class="number">{{ line.currency }} {{ line.lineTotal | number:'1.2-2' }}</td>
                  <td class="center">
                    <span *ngIf="line.isTaxable">Yes</span>
                    <span *ngIf="!line.isTaxable">No</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Notes -->
          <div class="notes" *ngIf="invoice()?.notes">
            <p><strong>Notes:</strong></p>
            <p>{{ invoice()?.notes }}</p>
          </div>

          <!-- Totals -->
          <div class="totals" *ngIf="invoice()?.totals as totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>{{ getCurrency() }} {{ totals.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row" *ngIf="totals.taxableBase > 0">
              <span>Taxable Base:</span>
              <span>{{ getCurrency() }} {{ totals.taxableBase | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row" *ngIf="totals.salesTaxAmount > 0">
              <span>Sales Tax ({{ (totals.salesTaxRate * 100).toFixed(0) }}%):</span>
              <span>{{ getCurrency() }} {{ totals.salesTaxAmount | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row" *ngIf="totals.discount > 0">
              <span>Discount:</span>
              <span>-{{ getCurrency() }} {{ totals.discount | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row grand-total">
              <span><strong>Grand Total:</strong></span>
              <span><strong>{{ getCurrency() }} {{ totals.grandTotal | number:'1.2-2' }}</strong></span>
            </div>
            <div class="totals-row" *ngIf="totals.amountPaid > 0">
              <span>Amount Paid:</span>
              <span>{{ getCurrency() }} {{ totals.amountPaid | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row amount-due">
              <span><strong>Amount Due:</strong></span>
              <span><strong>{{ getCurrency() }} {{ totals.amountDue | number:'1.2-2' }}</strong></span>
            </div>
          </div>
        </div>
      </app-card>

      <div *ngIf="loading()" class="loading">Loading...</div>
      <div *ngIf="!loading() && !invoice()" class="empty-state">Invoice not found</div>
    </div>
  `,
  styles: [`
    .invoice-view {
      padding: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header h1 {
      margin: 0;
    }

    .invoice-content {
      padding: 1rem;
    }

    .company-header {
      text-align: left;
      margin-bottom: 1rem;
    }

    .company-header h2 {
      margin: 0 0 0.5rem 0;
    }

    .company-header p {
      margin: 0.25rem 0;
    }

    hr {
      border: none;
      border-top: 1px solid #dee2e6;
      margin: 1.5rem 0;
    }

    .details-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .bill-to h4 {
      margin-top: 0;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }

    .invoice-table th,
    .invoice-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #dee2e6;
    }

    .invoice-table th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .invoice-table .number {
      text-align: right;
    }

    .invoice-table .center {
      text-align: center;
    }

    .notes {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .totals {
      margin-left: auto;
      max-width: 400px;
      border-top: 2px solid #000;
      padding-top: 1rem;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .totals-row.grand-total {
      font-size: 1.2rem;
      border-top: 1px solid #000;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
    }

    .totals-row.amount-due {
      font-size: 1.1rem;
      color: #dc3545;
    }

    .loading,
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #6c757d;
    }
  `]
})
export class InvoiceViewComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private route = inject(ActivatedRoute);

  invoice = signal<Invoice | null>(null);
  loading = signal(false);
  type = signal<'sale' | 'transaction'>('sale');
  id = signal<string>('');

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.type.set(params['type'] as 'sale' | 'transaction');
      this.id.set(params['id']);
      this.loadInvoice();
    });
  }

  private loadInvoice() {
    this.loading.set(true);
    const type = this.type();
    const id = this.id();

    const observable = type === 'sale'
      ? this.reportsService.getSaleInvoice(id)
      : this.reportsService.getTransactionInvoice(id);

    observable.subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load invoice', err);
        this.loading.set(false);
      }
    });
  }

  downloadPdf() {
    const type = this.type();
    const id = this.id();

    const observable = type === 'sale'
      ? this.reportsService.downloadSaleInvoicePdf(id)
      : this.reportsService.downloadTransactionInvoicePdf(id);

    observable.subscribe({
      next: (blob) => {
        const filename = `Invoice_${this.invoice()?.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        this.reportsService.downloadFile(blob, filename);
      },
      error: (err) => console.error('Failed to download PDF', err)
    });
  }

  getCurrency(): string {
    return this.invoice()?.lines[0]?.currency || 'USD';
  }
}
