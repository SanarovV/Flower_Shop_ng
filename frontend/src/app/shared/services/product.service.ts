import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ProductType} from "../../../types/product.type";
import {ActiveParamsType} from "../../../types/active-params.type";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) {
  }

  getBestProducts(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>('assets/products.json').pipe(
      map(products => products.slice(0, 4))
    );
  }

  getProducts(params: ActiveParamsType): Observable<{ totalCount: number, pages: number, items: ProductType[] }> {
    return this.http.get<ProductType[]>('assets/products.json').pipe(
      map(products => {
        return {
          totalCount: products.length,
          pages: 1,
          items: products
        };
      }));
  }

  searchProducts(query: string): Observable<ProductType[]> {
    return this.http.get<ProductType[]>('assets/products.json').pipe(
      map(products => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())))
    );
  }

  getProduct(url: string): Observable<ProductType> {
    return this.http.get<ProductType[]>('assets/products.json').pipe(
      map(products => {
        const found = products.find(p => p.name === url);
        if (!found) throw new Error('Product not found');
        return found;
      }));
  }
}
