import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService } from '../../services/bill.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './invoice-page.component.html',
  styleUrl: './invoice-page.component.scss',
})
export class InvoicePageComponent implements OnInit {
  invoiceForm: FormGroup;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billService: BillService
  ) {
    this.invoiceForm = this.fb.group({
      id: [''],
      customer: this.fb.group({
        name: ['', Validators.required],
        documentNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        address: ['', Validators.required],
      }),
      products: this.fb.array([]),
      totals: this.fb.group({
        subtotal: [{ value: 0, disabled: true }],
        totalVat: [{ value: 0, disabled: true }],
        grandTotal: [{ value: 0, disabled: true }],
      }),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditing = true;
      const invoice = this.billService.getInvoiceById(id);
      if (invoice) {
        this.invoiceForm.patchValue(invoice);
        invoice.products.forEach((product) => this.addProduct(product));
      }
    } else {
      this.isEditing = false;
      this.invoiceForm.patchValue({ id: this.billService.getNextInvoiceId() });
    }
  }

  get products(): FormArray {
    return this.invoiceForm.get('products') as FormArray;
  }

  addProduct(product: any = null): void {
    const productGroup = this.fb.group({
      number: [product?.number || '', Validators.required],
      description: [product?.description || '', Validators.required],
      quantity: [product?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [product?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      vat: [product?.vat || 19, Validators.required],
      vatAmount: [{ value: product?.vatAmount || 0, disabled: true }],
      rowTotal: [{ value: product?.rowTotal || 0, disabled: true }],
    });

    productGroup.valueChanges.subscribe(() => {
      this.updateTotals();  // Asegúrate de actualizar los totales al cambiar los valores
    });

    this.products.push(productGroup);
  }


  deleteProduct(index: number): void {
    this.products.removeAt(index);
    this.updateTotals();
  }

  updateTotals(): void {
    const totals = this.products.controls.reduce(
      (acc, control) => {
        const value = control.value;
        acc.subtotal += value.unitPrice * value.quantity;
        acc.totalVat += value.vatAmount;
        acc.grandTotal += value.rowTotal;
        return acc;
      },
      { subtotal: 0, totalVat: 0, grandTotal: 0 }
    );

    this.invoiceForm.patchValue(
      { totals },
      { emitEvent: false }
    );
  }



  saveInvoice(): void {
    if (this.invoiceForm.valid) {
      const invoice = this.invoiceForm.getRawValue();
      this.billService.saveInvoice(invoice);
      this.router.navigate(['/']);
    }
  }
}
