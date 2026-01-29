import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../auth';
import { UserDTO } from '../../../models/user.model';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Form
  profileForm!: FormGroup;

  // State signals
  user = signal<UserDTO | null>(null);
  isLoading = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Computed values
  hasUser = computed(() => this.user() !== null);
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  });
  fullName = computed(() => {
    const user = this.user();
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentUser();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]]
    });
  }

  loadCurrentUser(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getCurrentUser().subscribe({
      next: (user: UserDTO) => {
        this.user.set(user);
        this.profileForm.patchValue({
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load your profile. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading current user:', err);
      }
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.error.set(null);
    this.success.set(null);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
    this.error.set(null);
    this.success.set(null);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.error.set('Please fix all validation errors before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const updates = {
      email: this.profileForm.value.email,
      firstName: this.profileForm.value.firstName || undefined,
      lastName: this.profileForm.value.lastName || undefined
    };

    this.userService.updateProfile(updates).subscribe({
      next: (updatedUser: UserDTO) => {
        this.user.set(updatedUser);
        this.isSubmitting.set(false);
        this.isEditing.set(false);
        this.success.set('Profile updated successfully!');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        this.error.set('Failed to update profile. Please try again.');
        this.isSubmitting.set(false);
        console.error('Error updating profile:', err);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) return 'This field is required';
    if (field.hasError('email')) return 'Please enter a valid email address';
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }

    return 'Invalid value';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper for template access
  get f() {
    return this.profileForm.controls;
  }
}
