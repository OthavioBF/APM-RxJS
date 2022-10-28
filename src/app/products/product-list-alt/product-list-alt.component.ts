import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';

  private errorMessageSubject = new Subject();
  errorMessageSubject$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY
      })
    )

  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(+productId);

  }
}
