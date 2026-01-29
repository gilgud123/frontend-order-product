import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { UserDTO } from '../../../models/user.model';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form
  userForm!: FormGroup;

  // State signals
  isEditMode = signal<boolean>(false);
  userId = signal<number | undefined>(undefined);
  isSubmitting = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  // Computed values
  formTitle = computed(() => this.isEditMode() ? 'Edit User' : 'Create New User');
  submitButtonText = computed(() => this.isEditMode() ? 'Update User' : 'Create User');

  ngOnInit(): void {
    this.initializeForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      const userId = parseInt(id, 10);
      this.userId.set(userId);
      this.loadUser(userId);
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]]
    });

    // Add async validators for username and email uniqueness (only in create mode)
    if (!this.isEditMode()) {
      this.userForm.get('username')?.addAsyncValidators(this.usernameExistsValidator.bind(this));
      this.userForm.get('email')?.addAsyncValidators(this.emailExistsValidator.bind(this));
    }
  }

  private usernameExistsValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    if (!control.value) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.userService.usernameExists(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe({
        next: (exists) => {
          resolve(exists ? { usernameTaken: true } : null);
        },
        error: () => resolve(null)
      });
    });
  }

  private emailExistsValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    if (!control.value) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.userService.emailExists(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe({
        next: (exists) => {
          resolve(exists ? { emailTaken: true } : null);
        },
        error: () => resolve(null)
      });
    });
  }

  loadUser(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getById(id).subscribe({
      next: (user: UserDTO) => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load user details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.error.set('Please fix all validation errors before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(false);

    const user: UserDTO = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      firstName: this.userForm.value.firstName || undefined,
      lastName: this.userForm.value.lastName || undefined
    };

    const operation = this.isEditMode() && this.userId()
      ? this.userService.update(this.userId()!, user)
      : this.userService.create(user);

    operation.subscribe({
      next: (result: UserDTO) => {
        this.success.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.router.navigate(['/users', result.id]);
        }, 1500);
      },
      error: (err) => {
        this.error.set(
          this.isEditMode()
            ? 'Failed to update user. Please try again.'
            : 'Failed to create user. Please try again.'
        );
        this.isSubmitting.set(false);
        console.error('Error saving user:', err);
      }
    });
  }

  cancel(): void {
    if (this.userForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
  }

  private navigateBack(): void {
    if (this.isEditMode() && this.userId()) {
      this.router.navigate(['/users', this.userId()]);
    } else {
      this.router.navigate(['/users']);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
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
    if (field.hasError('email')) return 'Please enter a valid email address';
    if (field.hasError('usernameTaken')) return 'This username is already taken';
    if (field.hasError('emailTaken')) return 'This email is already registered';

    return 'Invalid value';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  // Helper for template access
  get f() {
    return this.userForm.controls;
  }
}
