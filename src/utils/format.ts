// src/utils/format.ts
export const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatTip = (amount: number, currency: string) => {
  switch (currency) {
    case "JPY":
      return `¥${amount}`;
    case "USD":
      return `$${amount}`;
    case "EUR":
      return `€${amount}`;
    default:
      return `${amount}`;
  }
};

export const formatDate = (dateString: string, locale: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
