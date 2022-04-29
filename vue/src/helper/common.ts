export const maskedAddress = (address: string) => {
  if (!address) return;
  return `${address.slice(0, 9)}...${address.slice(address.length - 9)}`;
};

export const sleepUtil = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatPrice = (value, decimal: number = 0) => {
  let val = (value / 1).toFixed(decimal);
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
