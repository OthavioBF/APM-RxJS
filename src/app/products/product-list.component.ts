import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Product } from './product';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedSubject$ = this.categorySelectedSubject.asObservable();

  products$ =  combineLatest([
    this.productService.productWithCategory$,
    this.categorySelectedSubject$
  ]).pipe(
    map(([products, selectedCategoryId]) => 
      products.filter(product => 
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    )
  )

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err
        return EMPTY;
      })
    )

  // productsSimpleFilter$ = this.productService.productWithCategory$
  //   .pipe(
  //     map(products => products.filter(product => 
  //       this.selectedCategoryId ? product.categoryId === this.selectedCategoryId : true  
  //     ))
  //   )

  constructor(
    private productService: ProductService, 
    private productCategoryService: ProductCategoryService
  ) { }

  onAdd(): void {
    this.productService.addProduct()
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
