export function formatCurrency(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function calculateDiscount(original, promo) {
  if (!original || !promo) return 0;
  const orig = parseFloat(original);
  const prom = parseFloat(promo);
  if (orig <= 0) return 0;
  return Math.round(((orig - prom) / orig) * 100);
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getWhatsAppLink(message = '', phone = '5541997246465') {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function getProductWhatsAppMessage(product) {
  const price = product.promoPrice || product.salePrice;
  return `Olá, tenho interesse neste produto:\n\n*${product.name}*\nPreço: ${formatCurrency(price)}\nLink: ${window.location.origin}/produto/${product.slug}`;
}

export const ORDER_STATUS_MAP = {
  RECEIVED: { label: 'Recebido', color: 'info' },
  ANALYZING: { label: 'Em Análise', color: 'warning' },
  PAID: { label: 'Pago', color: 'success' },
  SEPARATING: { label: 'Separação', color: 'primary' },
  SHIPPED: { label: 'Enviado', color: 'info' },
  DELIVERED: { label: 'Entregue', color: 'success' },
  CANCELLED: { label: 'Cancelado', color: 'danger' },
};
