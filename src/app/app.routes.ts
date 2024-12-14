import { Routes } from '@angular/router';
import { ListingPageComponent } from './pages/listing-page/listing-page.component';
import { InvoicePageComponent } from './pages/invoice-page/invoice-page.component';

export const routes: Routes = [
  {
    path: 'listing',
    component: ListingPageComponent
  },
  {
    path: 'invoice/:id',
    component: InvoicePageComponent
  },
  {
    path: 'invoice',
    component: InvoicePageComponent
  },
  {
    path: "**",
    redirectTo: 'listing'
  }
];
