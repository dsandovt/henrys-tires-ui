import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="date-range-filter">
      <button
        *ngFor="let preset of presets"
        class="preset-button"
        [class.preset-button--active]="selectedPreset() === preset.label"
        (click)="selectPreset(preset)"
        type="button"
      >
        {{ preset.label }}
      </button>
      <div class="custom-range" *ngIf="showCustom()">
        <input
          type="date"
          [(ngModel)]="customStartDate"
          (change)="onCustomDateChange()"
          class="date-input"
          [max]="customEndDate"
        />
        <span class="range-separator">to</span>
        <input
          type="date"
          [(ngModel)]="customEndDate"
          (change)="onCustomDateChange()"
          class="date-input"
          [min]="customStartDate"
        />
      </div>
    </div>
  `,
  styles: [`
    .date-range-filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .preset-button {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .preset-button:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      color: #374151;
    }

    .preset-button--active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #ffffff;
    }

    .preset-button--active:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    .custom-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-input {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: #374151;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      transition: border-color 0.2s ease;
    }

    .date-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .range-separator {
      font-size: 0.875rem;
      color: #9ca3af;
    }

    @media (max-width: 640px) {
      .date-range-filter {
        flex-direction: column;
        align-items: stretch;
      }

      .preset-button {
        justify-content: center;
      }
    }
  `]
})
export class DateRangeFilterComponent {
  @Output() rangeChange = new EventEmitter<DateRange>();

  selectedPreset = signal('Last 30 Days');
  showCustom = signal(false);

  customStartDate = this.formatDateInput(this.getLast30Days().startDate);
  customEndDate = this.formatDateInput(new Date());

  presets: DateRange[] = [
    {
      label: 'Today',
      startDate: this.getToday(),
      endDate: new Date()
    },
    {
      label: 'Last 7 Days',
      startDate: this.getLast7Days(),
      endDate: new Date()
    },
    {
      label: 'Last 30 Days',
      startDate: this.getLast30Days().startDate,
      endDate: new Date()
    },
    {
      label: 'This Month',
      startDate: this.getThisMonth(),
      endDate: new Date()
    },
    {
      label: 'Custom',
      startDate: new Date(),
      endDate: new Date()
    }
  ];

  ngOnInit() {
    // Emit default range (Last 30 Days)
    const defaultPreset = this.presets.find(p => p.label === 'Last 30 Days')!;
    this.rangeChange.emit(defaultPreset);
  }

  selectPreset(preset: DateRange): void {
    this.selectedPreset.set(preset.label);

    if (preset.label === 'Custom') {
      this.showCustom.set(true);
      this.onCustomDateChange();
    } else {
      this.showCustom.set(false);
      this.rangeChange.emit(preset);
    }
  }

  onCustomDateChange(): void {
    const range: DateRange = {
      label: 'Custom',
      startDate: new Date(this.customStartDate),
      endDate: new Date(this.customEndDate)
    };
    this.rangeChange.emit(range);
  }

  private getToday(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getLast7Days(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getLast30Days(): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
  }

  private getThisMonth(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
