import { TestBed } from '@angular/core/testing';
import { Storage } from './storage';

describe('Storage', () => {
  let service: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Storage);

    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('localStorage operations', () => {
    it('should save and retrieve a string value', () => {
      service.setLocal('test-key', 'test-value');
      const result = service.getLocal<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should save and retrieve an object', () => {
      const testObj = { name: 'John', age: 30 };
      service.setLocal('user', testObj);
      const result = service.getLocal<typeof testObj>('user');
      expect(result).toEqual(testObj);
    });

    it('should save and retrieve an array', () => {
      const testArray = [1, 2, 3, 4, 5];
      service.setLocal('numbers', testArray);
      const result = service.getLocal<number[]>('numbers');
      expect(result).toEqual(testArray);
    });

    it('should return null for non-existent key', () => {
      const result = service.getLocal('non-existent');
      expect(result).toBeNull();
    });

    it('should remove item from localStorage', () => {
      service.setLocal('test-key', 'test-value');
      service.removeLocal('test-key');
      const result = service.getLocal('test-key');
      expect(result).toBeNull();
    });

    it('should clear all items from localStorage', () => {
      service.setLocal('key1', 'value1');
      service.setLocal('key2', 'value2');
      service.clearLocal();
      expect(service.getLocal('key1')).toBeNull();
      expect(service.getLocal('key2')).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      spyOn(console, 'error');
      localStorage.setItem('bad-json', 'not-valid-json{');
      const result = service.getLocal('bad-json');
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('sessionStorage operations', () => {
    it('should save and retrieve a string value', () => {
      service.setSession('test-key', 'test-value');
      const result = service.getSession<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should save and retrieve an object', () => {
      const testObj = { id: 1, name: 'Product' };
      service.setSession('product', testObj);
      const result = service.getSession<typeof testObj>('product');
      expect(result).toEqual(testObj);
    });

    it('should return null for non-existent key', () => {
      const result = service.getSession('non-existent');
      expect(result).toBeNull();
    });

    it('should remove item from sessionStorage', () => {
      service.setSession('test-key', 'test-value');
      service.removeSession('test-key');
      const result = service.getSession('test-key');
      expect(result).toBeNull();
    });

    it('should clear all items from sessionStorage', () => {
      service.setSession('key1', 'value1');
      service.setSession('key2', 'value2');
      service.clearSession();
      expect(service.getSession('key1')).toBeNull();
      expect(service.getSession('key2')).toBeNull();
    });
  });

  describe('storage availability checks', () => {
    it('should detect localStorage availability', () => {
      expect(service.isLocalStorageAvailable()).toBe(true);
    });

    it('should detect sessionStorage availability', () => {
      expect(service.isSessionStorageAvailable()).toBe(true);
    });
  });

  describe('type safety', () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    it('should handle typed objects correctly', () => {
      const user: User = { id: 1, name: 'John Doe', email: 'john@example.com' };
      service.setLocal<User>('user', user);
      const retrieved = service.getLocal<User>('user');
      expect(retrieved).toEqual(user);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('John Doe');
    });

    it('should handle complex nested objects', () => {
      const complex = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'dark', notifications: true },
        items: [1, 2, 3]
      };
      service.setLocal('complex', complex);
      const retrieved = service.getLocal<typeof complex>('complex');
      expect(retrieved).toEqual(complex);
    });
  });
});


