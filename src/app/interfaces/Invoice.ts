import { Customer } from './Customer';
import { Product } from './Product';

export interface Invoice {
  id: string; // Unique identifier
  customer: Customer;
  products: Product[];
  totals: {
    subtotal: number;
    totalVat: number;
    grandTotal: number;
  };
}
