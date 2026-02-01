import { Injectable } from '@angular/core';

/**
 * Storage service - Type-safe wrapper for localStorage and sessionStorage.
 * Handles JSON serialization/deserialization and provides error handling.
 */
@Injectable({
  providedIn: 'root',
})
export class Storage {

  /**
   * Save item to localStorage with automatic JSON serialization
   */
  setLocal<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
    }
  }

  /**
   * Get item from localStorage with automatic JSON deserialization
   */
  getLocal<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeLocal(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clearLocal(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Save item to sessionStorage with automatic JSON serialization
   */
  setSession<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to sessionStorage [${key}]:`, error);
    }
  }

  /**
   * Get item from sessionStorage with automatic JSON deserialization
   */
  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from sessionStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage [${key}]:`, error);
    }
  }

  /**
   * Clear all items from sessionStorage
   */
  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Check if localStorage is available
   */
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  isSessionStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}


