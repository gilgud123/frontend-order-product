import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form
  productForm!: FormGroup;

  // State signals
  isEditMode = signal<boolean>(false);
  productId = signal<number | undefined>(undefined);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  // Computed values
  formTitle = computed(() => this.isEditMode() ? 'Edit Product' : 'Create New Product');
  submitButtonText = computed(() => this.isEditMode() ? 'Update Product' : 'Create Product');

  // Available categories
  readonly categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food', 'Other'];

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      const productId = parseInt(id, 10);
      this.productId.set(productId);
      this.loadProduct(productId);
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(999999)]],
      stockQuantity: [0, [Validators.required, Validators.min(0), Validators.max(999999)]],
      category: ['', [Validators.required]]
    });
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getById(id).subscribe({
      next: (product: ProductDTO) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load product details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.error.set('Please fix all validation errors before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const product: ProductDTO = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: parseFloat(this.productForm.value.price),
      stockQuantity: parseInt(this.productForm.value.stockQuantity, 10),
      category: this.productForm.value.category
    };

    const operation = this.isEditMode() && this.productId()
      ? this.productService.update(this.productId()!, product)
      : this.productService.create(product);

    operation.subscribe({
      next: (result: ProductDTO) => {
        this.success.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.router.navigate(['/products', result.id]);
        }, 1500);
      },
      error: (err) => {
        this.error.set(
          this.isEditMode()
            ? 'Failed to update product. Please try again.'
            : 'Failed to create product. Please try again.'
        );
        this.isSubmitting.set(false);
        console.error('Error saving product:', err);
      }
    });
  }

  cancel(): void {
    if (this.productForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
  }

  private navigateBack(): void {
    if (this.isEditMode() && this.productId()) {
      this.router.navigate(['/products', this.productId()]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return 'This field is required';
    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (field.hasError('min')) {
      const min = field.errors['min'].min;
      return `Value must be at least ${min}`;
    }
    if (field.hasError('max')) {
      const max = field.errors['max'].max;
      return `Value must not exceed ${max}`;
    }

    return 'Invalid value';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  // Helper for template access
  get f() {
    return this.productForm.controls;
  }
}
