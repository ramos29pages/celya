import { Injectable } from '@angular/core';
import { Invoice } from './../interfaces/Invoice';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  private localStorageKey = 'invoices';

  constructor() {}

  // Get all invoices
  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }

  // Get a single invoice by ID
  getInvoiceById(id: string): Invoice | null {
    const invoices = this.getInvoices();
    return invoices.find((invoice) => invoice.id === id) || null;
  }

  getNextInvoiceId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Check for duplicate IDs (optional)
    const existingIds = this.getInvoices().map(invoice => invoice.id);
    while (existingIds.includes(id)) {
      id = this.getNextInvoiceId(); // Regenerate if duplicate is found
    }
    return id;
  }

  // Save an invoice (new or edited)
  saveInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((f) => f.id === invoice.id);

    if (index >= 0) {
      invoices[index] = invoice; // Update existing invoice
    } else {
      invoices.push(invoice); // Add new invoice
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(invoices));
  }

  // Delete an invoice
  deleteInvoice(id: string): void {
    const invoices = this.getInvoices().filter((invoice) => invoice.id !== id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(invoices));
  }

  // Search invoices by name or document
  searchInvoices(term: string): Invoice[] {
    const invoices = this.getInvoices();
    return invoices.filter(
      (invoice) =>
        invoice.customer.name.includes(term) ||
        invoice.customer.documentNumber.includes(term)
    );
  }

  // Initialize example invoices
  initializeExampleInvoices(): void {
    const existingInvoices = this.getInvoices();

    if (existingInvoices.length === 0) {
      const exampleInvoices: Invoice[] = [
        {
          id: '1',
          customer: {
            name: 'Juan Pérez',
            documentNumber: '123456789',
            address: 'Calle Falsa 123',
          },
          products: [
            {
              number: '1',
              description: 'Laptop',
              quantity: 1,
              unitPrice: 1000,
              vat: 19,
              vatAmount: 190,
              rowTotal: 1190,
            },
            {
              number: '2',
              description: 'Mouse',
              quantity: 2,
              unitPrice: 25,
              vat: 19,
              vatAmount: 9.5,
              rowTotal: 59,
            },
          ],
          totals: {
            subtotal: 1050,
            totalVat: 199.5,
            grandTotal: 1249.5,
          },
        },
        {
          id: '2',
          customer: {
            name: 'Ana Gómez',
            documentNumber: '987654321',
            address: 'Avenida Siempreviva 456',
          },
          products: [
            {
              number: '1',
              description: 'Teclado',
              quantity: 1,
              unitPrice: 50,
              vat: 19,
              vatAmount: 9.5,
              rowTotal: 59.5,
            },
          ],
          totals: {
            subtotal: 50,
            totalVat: 9.5,
            grandTotal: 59.5,
          },
        },
      ];

      // Save example invoices to Local Storage
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(exampleInvoices)
      );
    }
  }
}
