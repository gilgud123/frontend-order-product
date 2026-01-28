import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  isSubmitting = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });
  }

  loadProduct(id: number): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      },
      error: (err) => {
        this.error = 'Failed to load product';
        console.error('Error loading product:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    const product: ProductDTO = this.productForm.value;

    const operation = this.isEditMode && this.productId
      ? this.productService.update(this.productId, product)
      : this.productService.create(product);

    operation.subscribe({
      next: (result) => {
        this.router.navigate(['/products', result.id]);
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Failed to update product' : 'Failed to create product';
        this.isSubmitting = false;
        console.error('Error saving product:', err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    if (field?.hasError('min')) return 'Value must be greater than or equal to 0';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}
