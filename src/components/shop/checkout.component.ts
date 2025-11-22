
import { Component, inject, signal, computed } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  template: `
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">إتمام الطلب</h1>

      @if (displayItems().length === 0) {
        <div class="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4 border border-yellow-200">
          السلة فارغة. <a routerLink="/" class="underline font-bold">تسوق الآن</a>
        </div>
      } @else {
        @if (isDirectBuy()) {
            <div class="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-4 text-sm">
               🚀 <strong>شراء سريع:</strong> أنت تقوم بشراء هذا المنتج مباشرة دون إضافته للسلة.
            </div>
        }

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            
            <!-- Contact Info -->
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input formControlName="name" type="text" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" placeholder="محمد بن محمد">
                @if (checkoutForm.get('name')?.touched && checkoutForm.get('name')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">الاسم مطلوب</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input formControlName="phone" type="tel" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="0550...">
                @if (checkoutForm.get('phone')?.touched && checkoutForm.get('phone')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">رقم الهاتف مطلوب (10 أرقام)</p>
                }
              </div>
            </div>

            <!-- Location -->
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">الولاية (التقسيم الإداري الجديد)</label>
                <select formControlName="wilaya" class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition">
                  <option value="" disabled>اختر الولاية</option>
                  @for (w of dataService.wilayas; track w.id) {
                    <option [value]="w.id + ' - ' + w.name">{{ w.id }} - {{ w.name }}</option>
                  }
                </select>
                 @if (checkoutForm.get('wilaya')?.touched && checkoutForm.get('wilaya')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">الولاية مطلوبة</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">العنوان بالتفصيل (البلدية / الحي)</label>
                <input formControlName="address" type="text" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="حي الزيتون، العمارة 4...">
                 @if (checkoutForm.get('address')?.touched && checkoutForm.get('address')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">العنوان مطلوب</p>
                }
              </div>
            </div>

            <!-- Order Summary Mini -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 class="font-bold text-gray-700 mb-3">ملخص الطلب</h3>
              @for (item of displayItems(); track $index) {
                <div class="flex justify-between text-sm mb-1">
                   <span>{{item.quantity}} x {{item.product.name}} <span class="text-xs text-gray-500">{{item.selectedColor ? '(' + item.selectedColor + ')' : ''}}</span></span>
                   <span>{{ (item.product.discountPrice || item.product.price) * item.quantity }} د.ج</span>
                </div>
              }
              
              <div class="border-t border-gray-200 mt-3 pt-2 text-sm flex justify-between">
                 <span>المجموع الفرعي</span>
                 <span class="font-medium">{{ orderSubtotal() }} د.ج</span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                 <span>تكلفة التوصيل</span>
                 <span class="font-medium text-blue-600">{{ shippingCost() }} د.ج</span>
              </div>
              
              <div class="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span class="text-emerald-600">{{ orderSubtotal() + shippingCost() }} د.ج</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">* الدفع نقداً عند الاستلام فقط</p>
            </div>

            <button 
              type="submit" 
              [disabled]="checkoutForm.invalid || isSubmitting()"
              [ngClass]="{'opacity-50 cursor-not-allowed': checkoutForm.invalid || isSubmitting()}"
              class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md transition text-lg flex justify-center items-center"
            >
              @if (isSubmitting()) {
                <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                جارٍ المعالجة...
              } @else {
                تأكيد الطلب ({{ orderSubtotal() + shippingCost() }} د.ج)
              }
            </button>
          </form>
        </div>
      }

      <!-- Success Modal Overlay -->
      @if (showSuccess()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك!</h2>
            <p class="text-gray-600 mb-6">شكراً لثقتك بنا. سنتصل بك قريباً لتأكيد الطلب.</p>
            <div class="bg-gray-50 p-3 rounded border border-gray-200 mb-6 select-all">
              <p class="text-xs text-gray-500 mb-1">رقم التتبع الخاص بك:</p>
              <p class="font-mono font-bold text-lg tracking-wider">{{ lastOrderId() }}</p>
            </div>
            <button (click)="closeSuccess()" class="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold w-full">العودة للمتجر</button>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent {
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);

  isSubmitting = signal(false);
  showSuccess = signal(false);
  lastOrderId = signal('');

  checkoutForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^0[567]\d{8}$/)]], 
    wilaya: ['', Validators.required],
    address: ['', Validators.required]
  });

  // Determine if we are in Direct Buy mode or Cart mode
  displayItems = computed(() => {
    const direct = this.dataService.directBuyItem();
    return direct ? [direct] : this.dataService.cart();
  });

  isDirectBuy = computed(() => !!this.dataService.directBuyItem());

  orderSubtotal = computed(() => {
     return this.displayItems().reduce((acc, item) => {
        const price = item.product.discountPrice || item.product.price;
        return acc + (price * item.quantity);
     }, 0);
  });

  // Computed shipping cost based on selected Wilaya
  shippingCost = computed(() => {
    const wilayaValue = this.checkoutForm.controls['wilaya'].value;
    if (!wilayaValue) return this.dataService.deliverySettings().globalPrice;
    
    // Parse ID from "01 - Adrar"
    const wilayaId = wilayaValue.split(' - ')[0];
    return this.dataService.getShippingPrice(wilayaId);
  });

  constructor() {
    // React to changes to update view if needed (though computed handles it)
    this.checkoutForm.get('wilaya')?.valueChanges.subscribe(() => {
        // Trigger change detection implicitly via signal read in template
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isSubmitting.set(true);
      setTimeout(() => {
        const val = this.checkoutForm.value;
        
        // Parse ID and Name
        const wilayaStr = val.wilaya!;
        const wilayaId = wilayaStr.split(' - ')[0];
        const wilayaName = wilayaStr.split(' - ')[1];

        const orderId = this.dataService.placeOrder({
          name: val.name!,
          phone: val.phone!,
          wilayaId: wilayaId,
          wilayaName: wilayaName,
          address: val.address!
        }, this.isDirectBuy());
        
        this.lastOrderId.set(orderId);
        this.isSubmitting.set(false);
        this.showSuccess.set(true);
      }, 1500);
    }
  }

  closeSuccess() {
    this.showSuccess.set(false);
    this.router.navigate(['/']);
  }
}
