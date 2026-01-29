export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static isPositiveNumber(value: number): boolean {
    return this.isNumber(value) && value > 0;
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return this.isNumber(value) && value >= min && value <= max;
  }

  static hasMinLength(text: string, minLength: number): boolean {
    return text.length >= minLength;
  }

  static hasMaxLength(text: string, maxLength: number): boolean {
    return text.length <= maxLength;
  }
}
