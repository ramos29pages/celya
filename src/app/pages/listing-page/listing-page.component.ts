import { Component, OnInit } from '@angular/core';
import { Invoice } from '../../interfaces/Invoice';
import { BillService } from '../../services/bill.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from "../../pipes/filter.pipe";

@Component({
  selector: 'app-listing-page',
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './listing-page.component.html',
  styleUrl: './listing-page.component.scss',
})
export class ListingPageComponent implements OnInit {


  invoices: Invoice[] = [];
  searchTerm: string = '';

  constructor(private billService: BillService, private router: Router) {}

  ngOnInit(): void {
    this.invoices = this.billService.getInvoices();
  }

  calculateTotalProducts(invoice: Invoice): number {
    return invoice.products.reduce((total, product) => total + product.quantity, 0);
  }

  trackById(index: number, invoice: Invoice): string {
    return invoice.id;
  }

  editInvoice(id: string): void {
    this.router.navigate(['/invoice', id]); // Navigate to the invoice page with ID
  }

  createInvoice(): void {
    this.router.navigate(['/invoice']); // Navigate to the invoice page for creation
  }


  // invoices: Invoice[] = []; // Array of Invoices with total products

  // constructor(private billService: BillService) {}

  // ngOnInit(): void {

  //    // Initialize example invoices if not already present
  //    this.billService.initializeExampleInvoices();

  //   this.invoices = this.billService.getInvoices().map((invoice) => ({
  //     ...invoice, // Spread operator to copy existing properties
  //     totalProducts: this.calculateTotalProducts(invoice), // Add totalProducts property
  //   }));
  // }

  // calculateTotalProducts(invoice: Invoice): number {
  //   return invoice.products.reduce((total, product) => total + product.quantity, 0);
  // }

  // trackById(index: number, invoice: any): number {
  //   return invoice.id;
  // }

}
