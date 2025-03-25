export function convertDateToEN(date: Date | string): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // ใช้ 24 ชั่วโมง (true = 12 ชั่วโมง AM/PM)
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function convertDateToENWithoutTime(date: Date | string): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
