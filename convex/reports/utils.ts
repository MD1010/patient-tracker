import { formatInTimeZone } from "date-fns-tz";

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const toBase64 = (uint8Array: Uint8Array): string => {
  let binary = "";
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

function getClientDate(
  dateInput: string | number,
  userTimeZone: string
): string {
  let date: Date;
  const isNumber = typeof dateInput === "number";

  if (isNumber) {
    const milliseconds = Math.floor(dateInput);
    date = new Date(milliseconds);
  } else {
    date = new Date(dateInput);
  }

  // Convert the date to the user's timezone and format it
  const zonedTime = formatInTimeZone(date, userTimeZone, "dd/MM/yyyy");

  return zonedTime;
}

export { base64ToUint8Array, getClientDate, toBase64 };
