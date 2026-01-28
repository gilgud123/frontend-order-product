export class StringUtils {
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  static isEmpty(text: string | null | undefined): boolean {
    return !text || text.trim().length === 0;
  }
}
