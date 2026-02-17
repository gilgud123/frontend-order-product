import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Api } from './api';

describe('Api', () => {
  let service: Api;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(Api);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('URL building', () => {
    it('should return base URL', () => {
      expect(service.getBaseUrl()).toBe('/api');
    });

    it('should build full URL from endpoint', () => {
      const url = service.buildUrl('users');
      expect(url).toBe('/api/users');
    });

    it('should build full URL from endpoint with leading slash', () => {
      const url = service.buildUrl('/users');
      expect(url).toBe('/api/users');
    });

    it('should build nested endpoint URLs', () => {
      const url = service.buildUrl('users/123/orders');
      expect(url).toBe('/api/users/123/orders');
    });
  });

  describe('parameter building', () => {
    it('should build HttpParams from object', () => {
      const params = service.buildParams({ page: 0, size: 10, sort: 'name' });

      expect(params.get('page')).toBe('0');
      expect(params.get('size')).toBe('10');
      expect(params.get('sort')).toBe('name');
    });

    it('should skip null and undefined values', () => {
      const params = service.buildParams({ page: 0, name: null, email: undefined });

      expect(params.get('page')).toBe('0');
      expect(params.has('name')).toBe(false);
      expect(params.has('email')).toBe(false);
    });

    it('should handle array parameters', () => {
      const params = service.buildParams({ ids: [1, 2, 3] });

      expect(params.getAll('ids')).toEqual(['1', '2', '3']);
    });

    it('should handle empty object', () => {
      const params = service.buildParams({});
      expect(params.keys().length).toBe(0);
    });
  });

  describe('header building', () => {
    it('should create default headers', () => {
      const headers = service.buildHeaders();
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should add additional headers', () => {
      const headers = service.buildHeaders({ 'X-Custom-Header': 'custom-value' });

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('HTTP methods', () => {
    it('should perform GET request', () => {
      const testData = { id: 1, name: 'Test' };

      service.get<typeof testData>('users/1').subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne('/api/users/1');
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });

    it('should perform GET request with parameters', () => {
      const params = { page: 0, size: 10 };

      service.get('users', params).subscribe();

      const req = httpMock.expectOne(req =>
        req.url === '/api/users' &&
        req.params.get('page') === '0' &&
        req.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should perform POST request', () => {
      const body = { name: 'New User', email: 'test@example.com' };
      const response = { id: 1, ...body };

      service.post('users', body).subscribe(data => {
        expect(data).toEqual(response);
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(response);
    });

    it('should perform PUT request', () => {
      const body = { name: 'Updated User' };

      service.put('users/1', body).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });

    it('should perform PATCH request', () => {
      const body = { name: 'Patched User' };

      service.patch('users/1', body).subscribe();

      const req = httpMock.expectOne('/api/users/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({});
    });

    it('should perform DELETE request', () => {
      service.delete('users/1').subscribe();

      const req = httpMock.expectOne('/api/users/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should perform DELETE request with parameters', () => {
      const params = { force: 'true' };

      service.delete('users/1', params).subscribe();

      const req = httpMock.expectOne(req =>
        req.url === '/api/users/1' &&
        req.params.get('force') === 'true'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('healthCheck', () => {
    it('should perform health check request', () => {
      service.healthCheck().subscribe();

      const req = httpMock.expectOne('/api/health');
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'ok' });
    });
  });

  describe('type safety', () => {
    interface User {
      id: number;
      name: string;
    }

    it('should handle typed responses', () => {
      const expectedUser: User = { id: 1, name: 'John' };

      service.get<User>('users/1').subscribe(user => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('John');
      });

      const req = httpMock.expectOne('/api/users/1');
      req.flush(expectedUser);
    });
  });
});


