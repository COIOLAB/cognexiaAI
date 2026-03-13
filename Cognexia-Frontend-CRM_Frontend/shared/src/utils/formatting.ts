// Formatting utilities
export class FormattingUtils {
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  static formatNumber(value: number, decimalPlaces: number = 2): string {
    return value.toFixed(decimalPlaces);
  }
}
