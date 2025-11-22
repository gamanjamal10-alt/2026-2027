
import { Component, inject, signal, computed } from '@angular/core';
import { DataService, Order, Carrier } from '../../services/data.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-manager',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-6">إدارة الطلبات والشحن</h1>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto border-b border-gray-200 pb-1">
       <button 
         (click)="filterStatus.set('all')" 
         [class]="filterStatus() === 'all' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
         class="px-4 py-2 border-b-2 font-medium transition whitespace-nowrap"
       >
         الكل
       </button>
       <button 
         (click)="filterStatus.set('new')" 
         [class]="filterStatus() === 'new' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
         class="px-4 py-2 border-b-2 font-medium transition whitespace-nowrap"
       >
         طلبات جديدة
       </button>
       <button 
         (click)="filterStatus.set('processing')" 
         [class]="filterStatus() === 'processing' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
         class="px-4 py-2 border-b-2 font-medium transition whitespace-nowrap"
       >
         قيد المعالجة
       </button>
       <button 
         (click)="filterStatus.set('shipped')" 
         [class]="filterStatus() === 'shipped' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
         class="px-4 py-2 border-b-2 font-medium transition whitespace-nowrap"
       >
         تم الشحن
       </button>
       <button 
         (click)="filterStatus.set('cancelled')" 
         [class]="filterStatus() === 'cancelled' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
         class="px-4 py-2 border-b-2 font-medium transition whitespace-nowrap"
       >
         ملغاة
       </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="p-4">#</th>
              <th class="p-4">الزبون</th>
              <th class="p-4">الولاية</th>
              <th class="p-4">المبلغ</th>
              <th class="p-4">حالة الطلب</th>
              <th class="p-4">حالة الشحن</th>
              <th class="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filteredOrders(); track order.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="p-4 font-mono">{{ order.id }}</td>
                <td class="p-4">
                   <div class="font-bold">{{ order.customerName }}</div>
                   <div class="text-xs text-gray-500">{{ order.phone }}</div>
                   <div class="text-[10px] text-gray-400">{{ order.date | date:'short' }}</div>
                </td>
                <td class="p-4">{{ order.wilaya }}</td>
                <td class="p-4 font-bold text-emerald-600">{{ order.total }} د.ج</td>
                <td class="p-4">
                   <select 
                     [ngModel]="order.status" 
                     (ngModelChange)="updateStatus(order.id, $event)"
                     class="bg-gray-100 border-none rounded text-xs p-1 font-bold cursor-pointer focus:ring-0"
                     [class.text-blue-600]="order.status === 'new'"
                     [class.text-emerald-600]="order.status === 'completed'"
                     [class.text-red-600]="order.status === 'cancelled'"
                   >
                     <option value="new">جديد</option>
                     <option value="processing">معالجة</option>
                     <option value="shipped">تم الشحن</option>
                     <option value="completed">مكتمل</option>
                     <option value="cancelled">ملغى</option>
                   </select>
                </td>
                <td class="p-4">
                  @if (order.status === 'shipped' || order.status === 'completed') {
                    <div class="flex flex-col">
                      <select 
                        [ngModel]="order.carrierStatus" 
                        (ngModelChange)="updateCarrierStatus(order.id, $event)"
                        class="bg-blue-50 border-blue-200 text-blue-800 rounded text-xs p-1 font-bold cursor-pointer focus:ring-0 mb-1"
                      >
                        <option [ngValue]="undefined">غير معروف</option>
                        <option value="sent">تم الإرسال</option>
                        <option value="transit">في الطريق</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="returned">تم الإرجاع</option>
                      </select>
                      <span class="text-[10px] text-gray-500">{{ order.shippingProvider }}</span>
                    </div>
                  } @else {
                    <span class="text-gray-300 text-xs">-</span>
                  }
                </td>
                <td class="p-4 flex justify-center gap-2">
                   <button (click)="viewLogs(order)" class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded" title="السجل">
                     📜
                   </button>
                   
                   @if (order.status === 'new' || order.status === 'processing') {
                     <button (click)="openShippingModal(order)" class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 shadow">
                       🚀 إرسال للشحن
                     </button>
                   } 
                </td>
              </tr>
            } @empty {
               <tr><td colspan="7" class="p-8 text-center text-gray-500">لا توجد طلبات في هذه القائمة.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Shipping Modal -->
    @if (selectedOrder) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-lg p-6">
          <h2 class="text-lg font-bold mb-4">إرسال الطلب لشركة الشحن</h2>
          
          <div class="mb-4 bg-gray-50 p-3 rounded border text-sm space-y-1">
             <p><strong>الزبون:</strong> {{ selectedOrder.customerName }}</p>
             <p><strong>العنوان:</strong> {{ selectedOrder.wilaya }}</p>
             <p><strong>المنتجات:</strong> {{ selectedOrder.items.length }} عنصر</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">شركات الشحن المتاحة لـ {{ selectedOrder.wilaya.split('-')[1] }}</label>
            
            @if (availableCarriers().length > 0) {
              <div class="space-y-2 max-h-48 overflow-y-auto">
                 @for (carrier of availableCarriers(); track carrier.id) {
                    <button 
                      (click)="selectedProviderId = carrier.id" 
                      [class.ring-2]="selectedProviderId === carrier.id"
                      [class.bg-blue-50]="selectedProviderId === carrier.id"
                      [class.border-blue-500]="selectedProviderId === carrier.id"
                      class="w-full text-right p-3 border rounded hover:bg-gray-50 flex items-center justify-between transition"
                    >
                       <div>
                          <div class="font-bold">{{ carrier.name }}</div>
                          <div class="text-xs text-gray-500">{{ carrier.notes || 'لا توجد ملاحظات' }}</div>
                       </div>
                       <span class="text-xs bg-gray-200 px-2 py-1 rounded uppercase">{{ carrier.contactMethod }}</span>
                    </button>
                 }
              </div>
            } @else {
               <div class="p-4 text-center text-red-500 bg-red-50 rounded border border-red-100">
                  لا توجد شركات شحن تغطي هذه الولاية حالياً. يرجى إضافة شركة وتعيين الولاية لها.
               </div>
            }
          </div>

          <button 
            (click)="confirmShipping()" 
            [disabled]="!selectedProviderId || isDispatching()"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            @if (isDispatching()) {
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               جارٍ الاتصال بالشركة...
            } @else {
               تأكيد وإرسال البيانات
            }
          </button>
          <button (click)="selectedOrder = null" [disabled]="isDispatching()" class="w-full mt-2 text-gray-500 text-sm py-2">إلغاء</button>
        </div>
      </div>
    }

    <!-- Logs Modal -->
    @if (viewLogsOrder) {
       <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
           <h3 class="font-bold text-lg mb-4">سجل نشاط الطلب #{{viewLogsOrder.id}}</h3>
           
           <div class="flex-grow overflow-y-auto space-y-4 pr-2">
              @for (log of viewLogsOrder.logs; track $index) {
                 <div class="relative pr-4 border-r-2 border-gray-200 pb-4 last:pb-0">
                    <div class="absolute -right-[5px] top-0 w-2 h-2 rounded-full" 
                         [class.bg-green-500]="log.status === 'success'"
                         [class.bg-red-500]="log.status === 'error'"
                         [class.bg-blue-500]="log.status === 'info'"
                    ></div>
                    <div class="text-xs text-gray-400 mb-1">{{ log.date | date:'medium' }}</div>
                    <div class="font-bold text-sm text-gray-800">{{ log.action }}</div>
                    <div class="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">{{ log.details }}</div>
                 </div>
              } @empty {
                 <p class="text-gray-500 text-center">لا توجد سجلات.</p>
              }
           </div>
           
           <button (click)="viewLogsOrder = null" class="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded font-bold hover:bg-gray-300">إغلاق</button>
        </div>
       </div>
    }
  `
})
export class OrdersManagerComponent {
  dataService = inject(DataService);
  
  filterStatus = signal<'all' | 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled'>('all');
  
  // Modal States
  selectedOrder: Order | null = null;
  viewLogsOrder: Order | null = null;
  
  selectedProviderId: string = '';
  isDispatching = signal(false);

  filteredOrders = computed(() => {
    const all = this.dataService.orders();
    const filter = this.filterStatus();
    if (filter === 'all') return all;
    return all.filter(o => o.status === filter);
  });

  availableCarriers = computed(() => {
     if (!this.selectedOrder) return [];
     const wilayaId = this.selectedOrder.wilaya.split(' - ')[0];
     return this.dataService.carriers().filter(c => c.wilayas.includes(wilayaId));
  });

  updateStatus(id: string, status: any) {
    this.dataService.updateOrderStatus(id, status);
  }
  
  updateCarrierStatus(id: string, status: any) {
    this.dataService.updateOrderStatus(id, 'shipped', undefined, undefined, status);
    if (status === 'delivered') {
       this.dataService.updateOrderStatus(id, 'completed', undefined, undefined, status);
    }
  }

  viewLogs(order: Order) {
    this.viewLogsOrder = order;
  }

  openShippingModal(order: Order) {
    this.selectedOrder = order;
    this.selectedProviderId = '';
  }

  async confirmShipping() {
    if (this.selectedOrder && this.selectedProviderId) {
      this.isDispatching.set(true);
      
      const result = await this.dataService.dispatchOrderToCarrier(this.selectedOrder.id, this.selectedProviderId);
      
      this.isDispatching.set(false);
      
      if (result.success) {
        // alert(result.message); // Optional
        this.selectedOrder = null; // Close modal
      } else {
        alert(result.message);
        // Keep modal open to retry or see details
      }
    }
  }
}
