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
        documentNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]+$/)],
        ],
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

  deleteProduct(index: number): void {
    this.products.removeAt(index);
    this.updateTotals();
  }

  updateTotals(): void {
    const products = this.products.controls;

    const totals = {
      subtotal: 0,
      totalVat: 0,
      grandTotal: 0,
    };

    products.forEach((productControl) => {
      const product = productControl.value;

      const unitPrice = product.unitPrice || 0;
      const quantity = product.quantity || 1;
      const vatRate = product.vat || 0;

      // Calcular valores por producto
      const productSubtotal = unitPrice * quantity;
      const productVatAmount = productSubtotal * (vatRate / 100);
      const productTotal = productSubtotal + productVatAmount;

      // Acumular totales
      totals.subtotal += productSubtotal;
      totals.totalVat += productVatAmount;
      totals.grandTotal += productTotal;
    });

    // Redondear a dos decimales
    totals.subtotal = Number(totals.subtotal.toFixed(2));
    totals.totalVat = Number(totals.totalVat.toFixed(2));
    totals.grandTotal = Number(totals.grandTotal.toFixed(2));

    // Actualizar formulario sin emitir evento
    this.invoiceForm.patchValue({ totals }, { emitEvent: false });
  }

  saveInvoice(): void {
    if (this.invoiceForm.valid) {
      // Obtener todos los valores, incluyendo los deshabilitados
      const invoice = this.invoiceForm.getRawValue();

      // Asegurar que los totales tengan valores
      invoice.totals = invoice.totals || {
        subtotal: 0,
        totalVat: 0,
        grandTotal: 0,
      };

      this.billService.saveInvoice(invoice);
      this.router.navigate(['/']);
    }
  }

  addProduct(product: any = null): void {
    const productGroup = this.fb.group({
      number: [product?.number || '', Validators.required],
      description: [product?.description || '', Validators.required],
      quantity: [
        product?.quantity || 1,
        [Validators.required, Validators.min(1)],
      ],
      unitPrice: [
        product?.unitPrice || 0,
        [Validators.required, Validators.min(0)],
      ],
      vat: [product?.vat || 19, Validators.required],
      vatAmount: [{ value: product?.vatAmount || 0, disabled: true }],
      rowTotal: [{ value: product?.rowTotal || 0, disabled: true }],
    });

    // Suscribirse a cambios para calcular automáticamente IVA y total de fila
    productGroup.valueChanges.subscribe((value) => {
      // Calcular el importe de IVA
      const vatAmount = Number(
        (((value.unitPrice || 0) * (value.vat || 0)) / 100).toFixed(2)
      );

      // Calcular el total de la fila
      const rowTotal = Number(
        ((value.unitPrice || 0) * (value.quantity || 1) + vatAmount).toFixed(2)
      );

      // Actualizar los campos de IVA y total sin disparar otro evento
      productGroup.patchValue(
        {
          vatAmount,
          rowTotal,
        },
        { emitEvent: false }
      );

      // Actualizar los totales generales
      this.updateTotals();
    });

    this.products.push(productGroup);
  }

  // addProduct(product: any = null): void {
  //   const productGroup = this.fb.group({
  //     number: [product?.number || '', Validators.required],
  //     description: [product?.description || '', Validators.required],
  //     quantity: [product?.quantity || 1, [Validators.required, Validators.min(1)]],
  //     unitPrice: [product?.unitPrice || 0, [Validators.required, Validators.min(0)]],
  //     vat: [product?.vat || 19, Validators.required],
  //     vatAmount: [{ value: product?.vatAmount || 0, disabled: true }],
  //     rowTotal: [{ value: product?.rowTotal || 0, disabled: true }],
  //   });

  //   // Cambio importante: Usar valueChanges del grupo completo
  //   productGroup.valueChanges.subscribe((value) => {
  //     if (value.unitPrice !== null && value.vat !== null && value.quantity !== null) {
  //       const vatAmount = (value.unitPrice * (value.vat / 100)) || 0;
  //       const rowTotal = ((value.unitPrice + vatAmount) * (value.quantity || 1)) || 0;

  //       productGroup.patchValue({
  //         vatAmount,
  //         rowTotal
  //       }, { emitEvent: false });

  //       // Llamar a updateTotals después de cada cambio
  //       this.updateTotals();
  //     }
  //   });

  //   this.products.push(productGroup);
  // }

  // updateTotals(): void {
  //   if (this.products.length === 0) {
  //     // Si no hay productos, resetear a 0
  //     this.invoiceForm.patchValue(
  //       {
  //         totals: {
  //           subtotal: 0,
  //           totalVat: 0,
  //           grandTotal: 0
  //         }
  //       },
  //       { emitEvent: false }
  //     );
  //     return;
  //   }

  //   const totals = this.products.controls.reduce(
  //     (acc, control) => {
  //       // Verificar que el control tenga un valor válido
  //       const value = control.value;
  //       if (value) {
  //         acc.subtotal += (value.unitPrice || 0) * (value.quantity || 1);
  //         acc.totalVat += (value.vatAmount || 0);
  //         acc.grandTotal += (value.rowTotal || 0);
  //       }
  //       return acc;
  //     },
  //     { subtotal: 0, totalVat: 0, grandTotal: 0 }
  //   );

  //   this.invoiceForm.patchValue(
  //     { totals },
  //     { emitEvent: false }
  //   );
  // }

  // saveInvoice(): void {
  //   if (this.invoiceForm.valid) {
  //     const invoice = this.invoiceForm.getRawValue();
  //     this.billService.saveInvoice(invoice);
  //     this.router.navigate(['/']);
  //   }
  // }
}
