// Validation functions
export function isValidDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

// Normalization functions
export function normalizeDate(value: string): string {
  const [day, month, year] = value.split("/");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// Format functions
export function formatDateInput(input: string): string {
  const digits = input.replace(/[^\d]/g, ''); // Remove non-numeric characters
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
    } else if (i === 1) {
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
    } else if (i === 2) {
      // First digit of month
      const d = parseInt(digits[i]);
      if (d > 1) {
        formatted += '0' + d + '/';
      } else {
        formatted += d;
      }
    } else if (i === 3) {
      // Second digit of month
      const prevDigit = parseInt(formatted[3]);
      const d = parseInt(digits[i]);
      if (prevDigit === 1 && d > 2) {
        formatted = formatted.slice(0, 3) + '12/';
      } else {
        formatted += d + '/';
      }
    } else if (i === 4 || i === 5 || i === 6 || i === 7) {
      // Year digits
      formatted += digits[i];
    }
  }

  // Auto-complete or validate the year
  const parts = formatted.split('/');
  if (parts.length === 3 && parts[2].length === 2) {
    const year = parseInt(parts[2]);

    if (year === 19 || year === 20) {
      // Delay completion for 19 or 20
      formatted = `${parts[0]}/${parts[1]}/${year}`;
    } else if (year < 20) {
      // Years < 20: Complete to 21st century
      formatted = `${parts[0]}/${parts[1]}/20${year.toString().padStart(2, '0')}`;
    } else if (year >= 20 && year <= 35) {
      // Years between 20 and 40: Complete to 21st century
      formatted = `${parts[0]}/${parts[1]}/20${year}`;
    } else {
      // Years > 40: Complete to 20th century
      formatted = `${parts[0]}/${parts[1]}/19${year}`;
    }
  } else if (parts.length === 3 && parts[2].length === 4) {
    const year = parseInt(parts[2]);
    if (year >= 1900 && year <= 2100) {
      // Valid year range
      formatted = `${parts[0]}/${parts[1]}/${year}`;
    } else {
      // Invalid year, reset (optional)
      formatted = `${parts[0]}/${parts[1]}/`;
    }
  }

  return formatted;
}

// Segment manipulation
export function deleteSegment(value: string, cursorPosition: number): string {
  const chars = value.split(""); // Convert the string into an array of characters

  if (cursorPosition > 0) {
    if (chars[cursorPosition - 1] === "/") {
      // If the cursor is on a `/`, delete the slash and move to the previous character
      chars.splice(cursorPosition - 1, 1);
    } else {
      // Otherwise, delete the character before the cursor
      chars.splice(cursorPosition - 1, 1);
    }
  }

  // Reconstruct the string and ensure slashes are in the correct positions
  let formattedValue = chars.join("");
  if (formattedValue.length > 2 && formattedValue[2] !== "/") {
    formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
  }
  if (formattedValue.length > 5 && formattedValue[5] !== "/") {
    formattedValue = formattedValue.slice(0, 5) + "/" + formattedValue.slice(5);
  }

  return formattedValue;
}
