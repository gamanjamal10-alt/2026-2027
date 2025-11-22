
import { Component, inject, signal } from '@angular/core';
import { DataService, Order } from '../../services/data.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-6">إدارة الطلبات والشحن</h1>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="p-4">#</th>
              <th class="p-4">الزبون</th>
              <th class="p-4">الولاية</th>
              <th class="p-4">الهاتف</th>
              <th class="p-4">المبلغ</th>
              <th class="p-4">حالة الطلب</th>
              <th class="p-4">حالة الشحن</th>
              <th class="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (order of dataService.orders(); track order.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="p-4 font-mono">{{ order.id }}</td>
                <td class="p-4">
                   <div class="font-bold">{{ order.customerName }}</div>
                   <div class="text-xs text-gray-500">{{ order.date | date:'short' }}</div>
                </td>
                <td class="p-4">{{ order.wilaya }}</td>
                <td class="p-4">{{ order.phone }}</td>
                <td class="p-4 font-bold text-emerald-600">{{ order.total }} د.ج</td>
                <td class="p-4">
                   <select 
                     [ngModel]="order.status" 
                     (ngModelChange)="updateStatus(order.id, $event)"
                     class="bg-gray-100 border-none rounded text-xs p-1 font-bold cursor-pointer focus:ring-0"
                     [class.text-blue-600]="order.status === 'new'"
                     [class.text-emerald-600]="order.status === 'completed'"
                   >
                     <option value="new">جديد</option>
                     <option value="processing">معالجة</option>
                     <option value="shipped">تم الشحن</option>
                     <option value="completed">مكتمل</option>
                     <option value="cancelled">ملغى</option>
                   </select>
                </td>
                <td class="p-4">
                  @if (order.status === 'shipped') {
                    <select 
                      [ngModel]="order.carrierStatus" 
                      (ngModelChange)="updateCarrierStatus(order.id, $event)"
                      class="bg-blue-50 border-blue-200 text-blue-800 rounded text-xs p-1 font-bold cursor-pointer focus:ring-0 w-28"
                    >
                      <option [ngValue]="undefined">اختر حالة</option>
                      <option value="sent">تم الإرسال</option>
                      <option value="transit">في الطريق</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="returned">تم الإرجاع</option>
                    </select>
                  } @else {
                    <span class="text-gray-300">-</span>
                  }
                </td>
                <td class="p-4">
                  @if (order.status !== 'shipped' && order.status !== 'cancelled') {
                    <button (click)="openShippingModal(order)" class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                      إرسال للشحن
                    </button>
                  } @else if (order.status === 'shipped') {
                     <div class="text-xs text-gray-500 flex flex-col">
                       <span class="font-bold">{{ order.shippingProvider }}</span>
                       <span class="font-mono text-[10px]">{{ order.trackingCode }}</span>
                     </div>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Shipping Modal -->
    @if (selectedOrder) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h2 class="text-lg font-bold mb-4">إرسال الطلب لشركة الشحن</h2>
          
          <div class="mb-4 bg-gray-50 p-3 rounded border text-sm">
             <p><strong>الزبون:</strong> {{ selectedOrder.customerName }}</p>
             <p><strong>العنوان:</strong> {{ selectedOrder.wilaya }} - {{ selectedOrder.address }}</p>
             <p><strong>المنتجات:</strong> {{ selectedOrder.items.length }} عنصر</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">اختر الشركة</label>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="selectedProvider = 'Yalidine'" [class.ring-2]="selectedProvider === 'Yalidine'" class="p-3 border rounded hover:bg-gray-50 flex items-center justify-center gap-2">
                 Yalidine
              </button>
              <button (click)="selectedProvider = 'ZR Express'" [class.ring-2]="selectedProvider === 'ZR Express'" class="p-3 border rounded hover:bg-gray-50 flex items-center justify-center gap-2">
                 ZR Express
              </button>
              <button (click)="selectedProvider = 'Tassili'" [class.ring-2]="selectedProvider === 'Tassili'" class="p-3 border rounded hover:bg-gray-50 flex items-center justify-center gap-2">
                 Tassili
              </button>
               <button (click)="selectedProvider = 'Bee Express'" [class.ring-2]="selectedProvider === 'Bee Express'" class="p-3 border rounded hover:bg-gray-50 flex items-center justify-center gap-2">
                 Bee Express
              </button>
            </div>
          </div>

          <button 
            (click)="confirmShipping()" 
            [disabled]="!selectedProvider"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            تأكيد وإرسال البيانات (API)
          </button>
          <button (click)="selectedOrder = null" class="w-full mt-2 text-gray-500 text-sm">إلغاء</button>
        </div>
      </div>
    }
  `
})
export class OrdersManagerComponent {
  dataService = inject(DataService);
  selectedOrder: Order | null = null;
  selectedProvider: string = '';

  updateStatus(id: string, status: any) {
    this.dataService.updateOrderStatus(id, status);
  }
  
  updateCarrierStatus(id: string, status: any) {
    this.dataService.updateOrderStatus(id, 'shipped', undefined, undefined, status);
    if (status === 'delivered') {
       this.dataService.updateOrderStatus(id, 'completed', undefined, undefined, status);
    }
  }

  openShippingModal(order: Order) {
    this.selectedOrder = order;
    this.selectedProvider = '';
  }

  confirmShipping() {
    if (this.selectedOrder && this.selectedProvider) {
      // Simulation of API Call
      const mockTrackingCode = 'TRK-' + Math.floor(Math.random() * 999999);
      
      this.dataService.updateOrderStatus(
        this.selectedOrder.id, 
        'shipped', 
        mockTrackingCode, 
        this.selectedProvider,
        'sent'
      );

      alert(`تم إرسال الطلب بنجاح إلى ${this.selectedProvider}.\nرقم التتبع: ${mockTrackingCode}`);
      this.selectedOrder = null;
    }
  }
}
