import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, combineLatest, forkJoin, merge, Observable, of, Subject, throwError } from 'rxjs';
import { map, tap, catchError, scan, shareReplay, switchMap, filter } from 'rxjs/operators';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  products$ = this.http.get<Product[]>(this.productsUrl);
  
  productWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
      map(([products, category]) => products.map(product => ({
        ...product,
        price: product.price ? product.price * 1.5 : 0,
        category: category.find(c => product.categoryId === c.id)?.name,
        searchKey: [product.productName]
      }) as Product)),
      shareReplay(1)
    );

  private selectedProductSubject = new BehaviorSubject<number>(0);
  selectedProductSubject$ = this.selectedProductSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productWithCategory$,
    this.selectedProductSubject$
  ])
    .pipe(
      map(([products, selectedProductId]) => 
      products.find(product => product.id === selectedProductId)),
      shareReplay(1)
    )

  // selectedProductSuppliers$ = combineLatest([
  //   this.selectedProduct$,
  //   this.supplierService.suppliers$
  // ]). pipe(
  //   map(([selectedProduct, suppliers]) =>
  //   suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id)))
  // )

  selectedProductSuppliers$  = this.selectedProduct$
    .pipe(
      filter(product => Boolean(product)),
      switchMap(selectedProduct => {
        if (selectedProduct?.supplierIds) {
          return forkJoin(selectedProduct.supplierIds.map(supplierId =>
            this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
        } else {
          return of([]);
        }
      })
    )

  private productInsertedSubject = new Subject<Product>();
  productInsertedSubject$ = this.productInsertedSubject.asObservable();

  productWithAdd$ = merge(
    this.productWithCategory$,
    this.productInsertedSubject$
  ).pipe(
    scan((acc, value) => 
      (value instanceof Array) 
        ? [...value] 
        : [...acc, value], [] as Product[]
    )
  )
  
  constructor(
    private http: HttpClient, 
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) { }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  selectedProductChanged(selectedProductId: number): void {
    this.selectedProductSubject.next(selectedProductId);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}