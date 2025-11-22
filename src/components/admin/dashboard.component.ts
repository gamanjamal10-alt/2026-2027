
import { Component, inject, computed } from '@angular/core';
import { DataService } from '../../services/data.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <h1 class="text-2xl font-bold mb-6">نظرة عامة</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">إجمالي المبيعات</div>
        <div class="text-2xl font-bold text-emerald-600">{{ totalRevenue() }} د.ج</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">الطلبات الجديدة</div>
        <div class="text-2xl font-bold text-blue-600">{{ newOrdersCount() }}</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">عدد المنتجات</div>
        <div class="text-2xl font-bold text-purple-600">{{ dataService.products().length }}</div>
      </div>
       <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-gray-500 text-sm mb-1">معدل الطلبات</div>
        <div class="text-2xl font-bold text-orange-600">{{ dataService.orders().length }}</div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 class="font-bold text-lg">آخر الطلبات</h2>
        <button class="text-emerald-600 text-sm font-medium hover:underline">عرض الكل</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="p-4">رقم الطلب</th>
              <th class="p-4">الزبون</th>
              <th class="p-4">الولاية</th>
              <th class="p-4">المبلغ</th>
              <th class="p-4">الحالة</th>
              <th class="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            @for (order of recentOrders(); track order.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="p-4 font-mono">{{ order.id }}</td>
                <td class="p-4">{{ order.customerName }}</td>
                <td class="p-4">{{ order.wilaya.split('-')[1] || order.wilaya }}</td>
                <td class="p-4 font-bold">{{ order.total }} د.ج</td>
                <td class="p-4">
                  <span [class]="getStatusClass(order.status)" class="px-2 py-1 rounded text-xs">
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-4 text-gray-500">{{ order.date | date:'shortDate' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent {
  dataService = inject(DataService);

  totalRevenue = computed(() => {
    return this.dataService.orders()
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  });

  newOrdersCount = computed(() => {
    return this.dataService.orders().filter(o => o.status === 'new').length;
  });

  recentOrders = computed(() => {
    return this.dataService.orders().slice(0, 5);
  });

  getStatusClass(status: string) {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
