
import { Component, inject, signal } from '@angular/core';
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

      @if (dataService.cart().length === 0) {
        <div class="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-4 border border-yellow-200">
          السلة فارغة. <a routerLink="/" class="underline font-bold">تسوق الآن</a>
        </div>
      } @else {
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
                <label class="block text-sm font-medium text-gray-700 mb-2">الولاية</label>
                <select formControlName="wilaya" class="w-full p-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition">
                  <option value="" disabled>اختر الولاية</option>
                  @for (w of wilayas; track w.id) {
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
              @for (item of dataService.cart(); track $index) {
                <div class="flex justify-between text-sm mb-1">
                   <span>{{item.quantity}} x {{item.product.name}}</span>
                   <span>{{ (item.product.discountPrice || item.product.price) * item.quantity }} د.ج</span>
                </div>
              }
              <div class="border-t border-gray-200 mt-3 pt-2 flex justify-between font-bold text-lg">
                <span>المجموع الكلي + التوصيل</span>
                <span class="text-emerald-600">{{ dataService.cartTotal() }} د.ج</span>
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
                تأكيد الطلب (الدفع عند الاستلام)
              }
            </button>
          </form>
        </div>
      }

      <!-- Success Modal Overlay (Simple implementation) -->
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
  fb = inject(FormBuilder);
  router = inject(Router);

  isSubmitting = signal(false);
  showSuccess = signal(false);
  lastOrderId = signal('');

  checkoutForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^0[567]\d{8}$/)]], // Basic Algerian phone regex
    wilaya: ['', Validators.required],
    address: ['', Validators.required]
  });

  // Full list of 58 wilayas + placeholders for new ones if needed
  wilayas = [
    { id: '01', name: 'أدرار' }, { id: '02', name: 'الشلف' }, { id: '03', name: 'الأغواط' }, { id: '04', name: 'أم البواقي' },
    { id: '05', name: 'باتنة' }, { id: '06', name: 'بجاية' }, { id: '07', name: 'بسكرة' }, { id: '08', name: 'بشار' },
    { id: '09', name: 'البليدة' }, { id: '10', name: 'البويرة' }, { id: '11', name: 'تمنراست' }, { id: '12', name: 'تبسة' },
    { id: '13', name: 'تلمسان' }, { id: '14', name: 'تيارت' }, { id: '15', name: 'تيزي وزو' }, { id: '16', name: 'الجزائر' },
    { id: '17', name: 'الجلفة' }, { id: '18', name: 'جيجل' }, { id: '19', name: 'سطيف' }, { id: '20', name: 'سعيدة' },
    { id: '21', name: 'سكيكدة' }, { id: '22', name: 'سيدي بلعباس' }, { id: '23', name: 'عنابة' }, { id: '24', name: 'قالمة' },
    { id: '25', name: 'قسنطينة' }, { id: '26', name: 'المدية' }, { id: '27', name: 'مستغانم' }, { id: '28', name: 'المسيلة' },
    { id: '29', name: 'معسكر' }, { id: '30', name: 'ورقلة' }, { id: '31', name: 'وهران' }, { id: '32', name: 'البيض' },
    { id: '33', name: 'إليزي' }, { id: '34', name: 'برج بوعريريج' }, { id: '35', name: 'بومرداس' }, { id: '36', name: 'الطارف' },
    { id: '37', name: 'تندوف' }, { id: '38', name: 'تيسمسيلت' }, { id: '39', name: 'الوادي' }, { id: '40', name: 'خنشلة' },
    { id: '41', name: 'سوق أهراس' }, { id: '42', name: 'تيبازة' }, { id: '43', name: 'ميلة' }, { id: '44', name: 'عين الدفلى' },
    { id: '45', name: 'النعامة' }, { id: '46', name: 'عين تموشنت' }, { id: '47', name: 'غرداية' }, { id: '48', name: 'غليزان' },
    { id: '49', name: 'تيميمون' }, { id: '50', name: 'برج باجي مختار' }, { id: '51', name: 'أولاد جلال' }, { id: '52', name: 'بني عباس' },
    { id: '53', name: 'عين صالح' }, { id: '54', name: 'عين قزام' }, { id: '55', name: 'تقرت' }, { id: '56', name: 'جانت' },
    { id: '57', name: 'المغير' }, { id: '58', name: 'المنيعة' }
  ];

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isSubmitting.set(true);
      setTimeout(() => {
        const val = this.checkoutForm.value;
        const orderId = this.dataService.placeOrder({
          name: val.name!,
          phone: val.phone!,
          wilaya: val.wilaya!,
          address: val.address!
        });
        
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
