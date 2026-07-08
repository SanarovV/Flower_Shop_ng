import {Injectable} from '@angular/core';
import {Observable, of, Subject, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CartType} from "../../../types/cart.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private count: number = 0;
  count$: Subject<number> = new Subject<number>();

  constructor(private http: HttpClient) {
  }

  setCount(count: number) {
    this.count = count;
    this.count$.next(this.count);
  }

  // Возвращаем пустую корзину без запроса к серверу
  getCart(): Observable<CartType | DefaultResponseType> {
    return of({ items: [] } as CartType);
  }

  // Возвращаем количество товаров равное 0
  getCartCount(): Observable<{ count: number } | DefaultResponseType> {
    return of({ count: 0 }).pipe(
      tap(data => {
        this.setCount(data.count);
      })
    );
  }

  // Метод добавления/удаления — локально обновляет плашку "В корзине"
  updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
    return of({ items: [] } as CartType).pipe(
      tap(() => {
        this.setCount(quantity);
      })
    );
  }

  // private count: number = 0;
  // count$: Subject<number> = new Subject<number>();
  //
  // constructor(private http: HttpClient) {
  // }
  //
  // setCount(count: number) {
  //   this.count = count;
  //   this.count$.next(this.count);
  // }
  //
  // getCart(): Observable<CartType | DefaultResponseType> {
  //   return this.http.get<CartType | DefaultResponseType>(environment.api + "cart", {withCredentials: true});
  // }
  //
  // getCartCount(): Observable<{ count: number } | DefaultResponseType> {
  //   return this.http.get<{
  //     count: number
  //   } | DefaultResponseType>(environment.api + "cart/count", {withCredentials: true})
  //     .pipe(
  //       tap(data => {
  //         if (!data.hasOwnProperty("error")) {
  //           this.setCount((data as { count: number }).count);
  //         }
  //       })
  //     );
  // }
  //
  // updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
  //   return this.http.post<CartType | DefaultResponseType>(environment.api + "cart", {
  //     productId,
  //     quantity
  //   }, {withCredentials: true})
  //     .pipe(
  //       tap(data => {
  //         if (!data.hasOwnProperty("error")) {
  //           let count = 0;
  //           (data as CartType).items.forEach(item => {
  //             count += item.quantity;
  //           })
  //           this.setCount(count);
  //         }
  //
  //       })
  //     );
  // }
}
