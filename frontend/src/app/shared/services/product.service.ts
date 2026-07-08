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

  getProducts(params: ActiveParamsType): Observable<{totalCount: number, pages: number, items: ProductType[]}> {
    return this.http.get<ProductType[]>('assets/products.json').pipe(
      map(products => {
        // 1. Фильтруем массив по категории (тип), если она выбрана пользователем
        let filteredProducts = products;
        if (params.types && params.types.length > 0) {
          filteredProducts = products.filter(p => params.types.includes(p.type.url));
        }

        // 2. Настраиваем параметры пагинации
        const itemsPerPage = 12; // Сколько карточек должно быть на одной странице
        const currentPage = params.page ? +params.page : 1; // Текущая страница (по умолчанию 1)

        const totalCount = filteredProducts.length;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // 3. Отрезаем нужную порцию карточек для текущей страницы
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredProducts.slice(startIndex, endIndex);

        return {
          totalCount: totalCount,
          pages: totalPages,
          items: paginatedItems
        };
      })
    );
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
