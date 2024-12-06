import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  if (!value) return '';
  
  const cleanValue = value.toString().replace(/[^\d.]/g, '');
  
  const parts = cleanValue.split('.');
  const whole = parts[0];
  const decimal = parts.length > 1 ? parts[1].slice(0, 2) : '';
  
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
}

export function parseCurrencyInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  const parsed = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const parts = parsed.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts[1];
  }
  
  return parsed;
}