import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { CustomerRevenueDTO } from '../../../models/customer-revenue.model';

@Component({
  selector: 'app-customer-revenue',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-revenue.component.html',
  styleUrl: './customer-revenue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerRevenueComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  // State signals
  revenueData = signal<CustomerRevenueDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchCustomerId = signal<string>('');

  // Computed values
  hasData = computed(() => this.revenueData().length > 0);
  totalRevenue = computed(() =>
    this.revenueData().reduce((sum, item) => sum + item.totalRevenue, 0)
  );
  filteredData = computed(() => {
    const search = this.searchCustomerId();
    if (!search) return this.revenueData();
    return this.revenueData().filter(item =>
      item.customerId.toString().includes(search)
    );
  });

  ngOnInit(): void {
    // Note: The API doesn't have an endpoint to get all customer revenues
    // This would need to be implemented on the backend
    // For now, we'll show a message that user needs to search by customer ID
  }

  searchRevenue(): void {
    const customerId = this.searchCustomerId();
    if (!customerId) {
      this.error.set('Please enter a customer ID');
      return;
    }

    const customerIdNum = parseInt(customerId, 10);
    if (isNaN(customerIdNum)) {
      this.error.set('Invalid customer ID');
      return;
    }

    this.loadCustomerRevenue(customerIdNum);
  }

  loadCustomerRevenue(customerId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.orderService.getCustomerRevenue(customerId).subscribe({
      next: (data: CustomerRevenueDTO[]) => {
        this.revenueData.set(data);
        this.isLoading.set(false);
        if (data.length === 0) {
          this.error.set('No revenue data found for this customer');
        }
      },
      error: (err) => {
        this.error.set('Failed to load revenue data. Customer may not exist or have no orders.');
        this.isLoading.set(false);
        console.error('Error loading customer revenue:', err);
      }
    });
  }

  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getYearColor(index: number): string {
    const colors = [
      '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565',
      '#38b2ac', '#ecc94b', '#ed64a6', '#4fd1c5', '#fc8181'
    ];
    return colors[index % colors.length];
  }
}
