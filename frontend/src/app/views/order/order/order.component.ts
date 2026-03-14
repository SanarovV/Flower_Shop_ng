import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;
  cart: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;

  orderForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    fatherName: [''],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: ['']
  })

  get firstName() {return this.orderForm.get("firstName")};
  get lastName() {return this.orderForm.get("lastName")};
  get fatherName() {return this.orderForm.get("fatherName")};
  get phone() {return this.orderForm.get("phone")};
  get email() {return this.orderForm.get("email")};
  get street() {return this.orderForm.get("street")};
  get house() {return this.orderForm.get("house")};
  get entrance() {return this.orderForm.get("entrance")};
  get apartment() {return this.orderForm.get("apartment")};
  get comment() {return this.orderForm.get("comment")};

  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(private cartService: CartService,
              private userService: UserService,
              private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private orderService: OrderService) {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit(): void {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;
        if (!this.cart || (this.cart && this.cart.items.length === 0)) {
          this._snackBar.open('Корзина пустая');
          this.router.navigate(['/']).then();
          return;
        }
        this.calculateTotal();
      });

    if (this.authService.getIsLoggedIn()) {
      this.userService.getUserInformation()
        .subscribe((data: UserInfoType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          const userInfo = data as UserInfoType;
          const paramsToUpdate = {
            firstName: userInfo.firstName ? userInfo.firstName : '',
            lastName: userInfo.lastName ? userInfo.lastName : '',
            phone: userInfo.phone ? userInfo.phone : '',
            fatherName: userInfo.fatherName ? userInfo.fatherName : '',
            paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
            email: userInfo.email ? userInfo.email : '',
            street: userInfo.street ? userInfo.street : '',
            house: userInfo.house ? userInfo.house : '',
            entrance: userInfo.entrance ? userInfo.entrance : '',
            apartment: userInfo.apartment ? userInfo.apartment : '',
            comment: '',
          }

          this.orderForm.setValue(paramsToUpdate);
          if (userInfo.deliveryType) {
            this.deliveryType = userInfo.deliveryType;
          }
        });
    }
  }

  calculateTotal() {
    this.totalAmount = 0;
    this.totalCount = 0;
    if (this.cart) {
      this.cart.items.forEach(item => {
        this.totalAmount += item.quantity * item.product.price;
        this.totalCount += item.quantity;
      })
    }
  }

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation() {
    if (this.deliveryType == DeliveryType.delivery) {
      this.street?.setValidators(Validators.required);
      this.house?.setValidators(Validators.required);
    } else {
      this.street?.removeValidators(Validators.required);
      this.house?.removeValidators(Validators.required);
      this.street?.setValue('');
      this.house?.setValue('');
      this.entrance?.setValue('');
      this.apartment?.setValue('');
    }

    this.street?.updateValueAndValidity();
    this.house?.updateValueAndValidity();
  }

  createOrder() {
    if (this.orderForm.valid && this.orderForm.value.firstName &&
    this.orderForm.value.lastName && this.orderForm.value.phone &&
    this.orderForm.value.paymentType && this.orderForm.value.email) {

      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email,
      };

      if (this.deliveryType === DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }
        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }
        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }
        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
      }

      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }

      this.orderService.createOrder(paramsObject)
        .subscribe({
          next: (data: OrderType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            this.dialogRef = this.dialog.open(this.popup);
            this.dialogRef.backdropClick()
              .subscribe(() => {
                this.router.navigate(['/']).then();
              });
            this.cartService.setCount(0);
          },
          error: (errorRes: HttpErrorResponse) => {
            if (errorRes.error && errorRes.error.message) {
              this._snackBar.open(errorRes.error.message);
            } else {
              this._snackBar.open('Ошибка заказа');
            }
          }
          });
    } else  {
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните необходимые поля!');
    }
  }

  closePopup(): void {
    this.dialogRef?.close();
    this.router.navigate(['/']).then();
  }
}
