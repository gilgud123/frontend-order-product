import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../auth';
import { OrderDTO } from '../../../models/order.model';
import { ProductDTO } from '../../../models/product.model';

@Component({
  selector: 'app-create-order',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form
  orderForm!: FormGroup;

  // State signals
  availableProducts = signal<ProductDTO[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
  }

  private initializeForm(): void {
    this.orderForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      productIds: this.fb.array([], Validators.required)
    });
  }

  get productIds(): FormArray {
    return this.orderForm.get('productIds') as FormArray;
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll(0, 100).subscribe({
      next: (response) => {
        this.availableProducts.set(response.content.filter(p => p.stockQuantity && p.stockQuantity > 0));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products.');
        this.isLoading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  addProduct(): void {
    this.productIds.push(this.fb.control('', [Validators.required, Validators.min(1)]));
  }

  removeProduct(index: number): void {
    this.productIds.removeAt(index);
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const formValue = this.orderForm.value;
    const orderData: OrderDTO = {
      userId: parseInt(formValue.userId, 10),
      productIds: formValue.productIds.map((id: string) => parseInt(id, 10))
    };

    this.orderService.create(orderData).subscribe({
      next: (createdOrder) => {
        this.success.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.router.navigate(['/orders', createdOrder.id]);
        }, 1500);
      },
      error: (err) => {
        this.error.set('Failed to create order. Please try again.');
        this.isSubmitting.set(false);
        console.error('Error creating order:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/orders']);
  }

  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
