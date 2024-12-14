import { Pipe, PipeTransform } from '@angular/core';
import { Invoice } from '../interfaces/Invoice';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(invoices: Invoice[], searchTerm: string): Invoice[] {
    if (!searchTerm) {
      return invoices;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return invoices.filter(invoice => {
      const customerName = invoice.customer.name.toLowerCase();
      const customerDocumentNumber = invoice.customer.documentNumber.toLowerCase();
      return customerName.includes(lowercaseSearchTerm) || customerDocumentNumber.includes(lowercaseSearchTerm);
    });
  }

}
