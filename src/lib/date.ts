// Validation functions
export function isValidDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

// Normalization functions
export function normalizeDate(value: string): string {
  const [day, month, year] = value.split('/');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Format functions
export function formatDateInput(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  
  // Handle special case for numbers like 35 -> 03/05
  if (digits.length === 2) {
    const num = parseInt(digits);
    if (num > 31) {
      const day = Math.min(Math.floor(num / 10), 31);
      const month = num % 10;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/`;
    }
  }

  let formatted = '';
  for (let i = 0; i < digits.length && i < 8; i++) {
    if (i === 0) {
      // First digit of day
      const d = parseInt(digits[i]);
      if (d > 3) {
        formatted = '0' + d + '/';
      } else {
        formatted = d.toString();
      }
    }
    else if (i === 1) {
      // Second digit of day
      const prevDigit = parseInt(formatted[0]);
      const d = parseInt(digits[i]);
      if (prevDigit === 3 && d > 1) {
        formatted = '31/';
      } else if (prevDigit === 0 && d === 0) {
        formatted = '01/';
      } else {
        formatted += d + '/';
      }
    }
    else if (i === 2) {
      // First digit of month
      const d = parseInt(digits[i]);
      if (d > 1) {
        formatted += '0' + d + '/';
      } else {
        formatted += d;
      }
    }
    else if (i === 3) {
      // Second digit of month
      const prevDigit = parseInt(formatted[3]);
      const d = parseInt(digits[i]);
      if (prevDigit === 1 && d > 2) {
        formatted = formatted.slice(0, 3) + '12/';
      } else {
        formatted += d + '/';
      }
    }
    else {
      // Year digits
      formatted += digits[i];
    }
  }
  
  return formatted;
}

// Cursor position utilities
export function getNewCursorPosition(value: string, currentPosition: number): number {
  const segments = value.split('/');
  const positions = [0, 3, 6]; // Start positions of day, month, year

  // Find which segment we're in
  let segmentIndex = positions.findIndex(pos => currentPosition <= (pos + 2));
  if (segmentIndex === -1) segmentIndex = 2; // Year segment

  // Return the start of the current segment
  return positions[segmentIndex];
}

// Segment manipulation
export function deleteSegment(value: string, cursorPosition: number): string {
  const segments = value.split('/');
  
  // If cursor is at the end of a segment (on slash), delete the entire segment
  if (cursorPosition === 3) { // After day
    return segments.slice(1).join('/');
  } else if (cursorPosition === 6) { // After month
    return segments[0] + '/' + segments[2];
  }

  // Find which segment we're in
  if (cursorPosition <= 2) { // Day segment
    return segments.slice(1).join('/');
  } else if (cursorPosition <= 5) { // Month segment
    return segments[0] + '/' + (segments[2] || '');
  } else { // Year segment
    return segments.slice(0, 2).join('/') + '/';
  }
}