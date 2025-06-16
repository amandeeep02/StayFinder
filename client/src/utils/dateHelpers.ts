export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateRange = (checkIn: string, checkOut: string): string => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  return `${start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} - ${end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(price);
};