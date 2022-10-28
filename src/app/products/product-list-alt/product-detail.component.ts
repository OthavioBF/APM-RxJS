import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs';
import { Supplier } from 'src/app/suppliers/supplier';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  productSuppliers: Supplier[] | null = null;

  product$ = this.productService.selectedProduct$

  pageTitle$ = this.product$
    .pipe(
      map(p => p ? `ProductDetail for: ${p.productName}` : null)
    )

  productSuppliers$ = this.productService.selectedProductSuppliers$

  constructor(private productService: ProductService) { }

}
