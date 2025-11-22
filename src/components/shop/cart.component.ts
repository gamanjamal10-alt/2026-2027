
import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">سلة المشتريات</h1>

      @if (dataService.cart().length > 0) {
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Items List -->
          <div class="lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            @for (item of dataService.cart(); track $index) {
              <div class="p-4 flex gap-4 border-b border-gray-100 last:border-0">
                <div class="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                   <img [ngSrc]="item.product.image" width="80" height="80" class="w-full h-full object-cover" alt="Product">
                </div>
                <div class="flex-grow">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-gray-800">{{ item.product.name }}</h3>
                      @if (item.selectedColor) {
                        <p class="text-sm text-gray-500">اللون: {{ item.selectedColor }}</p>
                      }
                    </div>
                    <button (click)="dataService.removeFromCart($index)" class="text-red-500 hover:text-red-700 text-sm">حذف</button>
                  </div>
                  <div class="mt-2 flex justify-between items-end">
                    <div class="text-sm text-gray-600">الكمية: {{ item.quantity }}</div>
                    <div class="font-bold text-emerald-600">
                      {{ (item.product.discountPrice || item.product.price) * item.quantity }} د.ج
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="lg:w-1/3">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 class="font-bold text-lg mb-4">ملخص الطلب</h2>
              <div class="flex justify-between mb-2 text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{{ dataService.cartTotal() }} د.ج</span>
              </div>
              <div class="flex justify-between mb-4 text-gray-600">
                <span>التوصيل</span>
                <span>يحسب عند الدفع</span>
              </div>
              <div class="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl mb-6">
                <span>الإجمالي</span>
                <span class="text-emerald-600">{{ dataService.cartTotal() }} د.ج</span>
              </div>
              <a routerLink="/checkout" class="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-lg font-bold shadow-md transition">
                متابعة الشراء
              </a>
              <a routerLink="/" class="block w-full text-center mt-3 text-gray-500 text-sm hover:text-gray-700">
                إكمال التسوق
              </a>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <p class="text-lg text-gray-500 mb-4">سلتك فارغة حالياً</p>
          <a routerLink="/" class="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-700 transition">تصفح المنتجات</a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  dataService = inject(DataService);
}
