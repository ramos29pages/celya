import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { ListingPageComponent } from './pages/listing-page/listing-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule
  ],
  template: `<router-outlet />`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'celya';
}
