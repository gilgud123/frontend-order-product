import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { UserDTO } from '../models/user.model';
import { PaginatedResponse } from '../shared';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const API_URL = '/api/users';

  const mockUser: UserDTO = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockPaginatedResponse: PaginatedResponse<UserDTO> = {
    content: [mockUser],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all users with pagination', () => {
      service.getAll(0, 10).subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
        expect(response.content.length).toBe(1);
        expect(response.content[0].username).toBe('testuser');
      });

      const req = httpMock.expectOne(`${API_URL}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should use default pagination parameters', () => {
      service.getAll().subscribe();

      const req = httpMock.expectOne(`${API_URL}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should handle errors', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${API_URL}?page=0&size=10`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getById', () => {
    it('should fetch user by ID', () => {
      service.getById(1).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.id).toBe(1);
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle 404 error', () => {
      service.getById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('search', () => {
    it('should search users with query', () => {
      service.search('test', 0, 10).subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/search?query=test&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should use default pagination for search', () => {
      service.search('test').subscribe();

      const req = httpMock.expectOne(`${API_URL}/search?query=test&page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('getByUsername', () => {
    it('should fetch user by username', () => {
      service.getByUsername('testuser').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.username).toBe('testuser');
      });

      const req = httpMock.expectOne(`${API_URL}/username/testuser`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('getByEmail', () => {
    it('should fetch user by email', () => {
      service.getByEmail('test@example.com').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${API_URL}/email?email=test@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', () => {
      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', () => {
      const newUser: UserDTO = { ...mockUser, id: undefined };

      service.create(newUser).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.id).toBe(1);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockUser);
    });

    it('should handle validation errors', () => {
      const invalidUser: UserDTO = { ...mockUser, email: 'invalid' };

      service.create(invalidUser).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Validation Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing user', () => {
      const updatedUser: UserDTO = { ...mockUser, firstName: 'Updated' };

      service.update(1, updatedUser).subscribe(user => {
        expect(user.firstName).toBe('Updated');
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedUser);
      req.flush(updatedUser);
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', () => {
      const updates = { firstName: 'Updated' };

      service.updateProfile(updates).subscribe(user => {
        expect(user.firstName).toBe('Updated');
      });

      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockUser, ...updates });
    });

    it('should allow partial updates', () => {
      const updates: Partial<UserDTO> = { email: 'newemail@example.com' };

      service.updateProfile(updates).subscribe();

      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockUser, ...updates });
    });
  });

  describe('delete', () => {
    it('should delete a user', () => {
      service.delete(1).subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete errors', () => {
      service.delete(1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('usernameExists', () => {
    it('should return true when username exists', () => {
      service.usernameExists('testuser').subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${API_URL}/exists/username/testuser`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false when username does not exist', () => {
      service.usernameExists('newuser').subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${API_URL}/exists/username/newuser`);
      req.flush(false);
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', () => {
      service.emailExists('test@example.com').subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${API_URL}/exists/email?email=test@example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false when email does not exist', () => {
      service.emailExists('new@example.com').subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${API_URL}/exists/email?email=new@example.com`);
      req.flush(false);
    });
  });

  describe('getByRole', () => {
    it('should fetch users by role with pagination', () => {
      service.getByRole('ADMIN', 0, 10).subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/role/ADMIN?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });

    it('should use default pagination for role query', () => {
      service.getByRole('USER').subscribe();

      const req = httpMock.expectOne(`${API_URL}/role/USER?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPaginatedResponse);
    });
  });

  describe('error handling', () => {
    it('should log errors in handleError', () => {
      spyOn(console, 'error');

      service.getById(1).subscribe({
        next: () => fail('should have failed'),
        error: () => {
          expect(console.error).toHaveBeenCalledWith('UserService Error:', jasmine.any(Object));
        }
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
