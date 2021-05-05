export const calcWeight = (weightClass, quantity) => {
  switch (weightClass) {
    case "0": // Very Light 
      return quantity * 0.25;
    case "1": // Light
      return quantity * 0.5;
    default: // Average
      return quantity;
    case "3": // Heavy
      return quantity * 1.5;
    case "4": // Very Heavy
      return quantity * 2;
  }
};
