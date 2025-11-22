
import { Component, inject, signal } from '@angular/core';
import { DataService, Order } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="max-w-xl mx-auto mt-10">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">تتبع طلبك</h1>
        <p class="text-gray-500">أدخل رقم التتبع أو رقم الطلب لمعرفة حالته</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="trackingId" 
            placeholder="مثال: ORD-123456" 
            class="flex-grow p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
          <button (click)="searchOrder()" class="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">بحث</button>
        </div>
      </div>

      @if (foundOrder(); as order) {
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-emerald-500">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="font-bold text-lg text-gray-800">تفاصيل الطلب #{{order.id}}</h3>
              <p class="text-sm text-gray-500">{{ order.date | date:'medium' }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
              {{ getStatusText(order.status) }}
            </span>
          </div>

          <div class="space-y-6">
             <!-- Status Timeline (Simplified) -->
             <div class="relative pl-4 border-r-2 border-gray-200 space-y-8">
                <div class="relative">
                  <div class="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <h4 class="font-bold text-sm">تم استلام الطلب</h4>
                  <p class="text-xs text-gray-500">طلبك قيد المراجعة</p>
                </div>
                
                <div class="relative" [class.opacity-40]="order.status === 'new'">
                  <div class="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" [class.bg-gray-300]="order.status === 'new'"></div>
                  <h4 class="font-bold text-sm">تجهيز الطلب</h4>
                  <p class="text-xs text-gray-500">يتم تغليف المنتجات</p>
                </div>

                <div class="relative" [class.opacity-40]="order.status === 'new' || order.status === 'processing'">
                  <div class="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" [class.bg-gray-300]="order.status === 'new' || order.status === 'processing'"></div>
                  <h4 class="font-bold text-sm">تم الشحن</h4>
                  <p class="text-xs text-gray-500">
                     @if (order.trackingCode) {
                        مع شركة {{ order.shippingProvider }} (كود: {{ order.trackingCode }})
                     } @else {
                        في انتظار التسليم لشركة النقل
                     }
                  </p>
                </div>
                
                 <div class="relative" [class.opacity-40]="order.status !== 'completed'">
                  <div class="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white" [class.bg-gray-300]="order.status !== 'completed'"></div>
                  <h4 class="font-bold text-sm">تم التوصيل</h4>
                  <p class="text-xs text-gray-500">شكراً لتعاملك معنا</p>
                </div>
             </div>
          </div>
        </div>
      } @else if (searched) {
        <div class="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          لم يتم العثور على طلب بهذا الرقم. يرجى التأكد والمحاولة مرة أخرى.
        </div>
      }
    </div>
  `
})
export class TrackingComponent {
  dataService = inject(DataService);
  trackingId = signal('');
  foundOrder = signal<Order | null>(null);
  searched = signal(false);

  searchOrder() {
    this.searched.set(true);
    const order = this.dataService.orders().find(o => o.id === this.trackingId().trim() || o.trackingCode === this.trackingId().trim());
    this.foundOrder.set(order || null);
  }

  getStatusText(status: string) {
    const map: Record<string, string> = {
      'new': 'جديد',
      'processing': 'قيد المعالجة',
      'shipped': 'تم الشحن',
      'completed': 'مكتمل',
      'cancelled': 'ملغى'
    };
    return map[status] || status;
  }
}
