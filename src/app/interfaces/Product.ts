// product.interface.ts
export interface Product {
  number: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number; // % (0, 12, 19)
  vatAmount: number; // Calculated
  rowTotal: number; // Calculated
}
