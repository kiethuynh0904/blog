export const maskedAddress = (address: string) => {
  if (!address) return;
  return `${address.slice(0, 9)}...${address.slice(address.length - 9)}`;
};

export const sleepUtil = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
