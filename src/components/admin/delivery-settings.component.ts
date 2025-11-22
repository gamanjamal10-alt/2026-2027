
import { Component, inject, signal } from '@angular/core';
import { DataService, DeliverySettings } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">إدارة أسعار التوصيل</h1>

      <!-- Global Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold mb-4 text-gray-800">السعر الافتراضي</h2>
        <div class="flex items-center gap-4">
          <div class="w-full md:w-1/2">
             <label class="block text-sm font-medium text-gray-700 mb-1">سعر التوصيل العام (د.ج)</label>
             <input type="number" [(ngModel)]="settings.globalPrice" class="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none">
             <p class="text-xs text-gray-500 mt-1">يطبق هذا السعر على جميع الولايات ما لم يتم تفعيل التخصيص.</p>
          </div>
        </div>
      </div>

      <!-- Custom Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h2 class="text-lg font-bold text-gray-800">تخصيص حسب الولاية</h2>
             <p class="text-sm text-gray-500">تفعيل أسعار مختلفة لكل ولاية</p>
           </div>
           
           <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="settings.useCustomPerWilaya" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span class="mr-3 text-sm font-medium text-gray-900">{{ settings.useCustomPerWilaya ? 'مفعّل' : 'معطّل' }}</span>
            </label>
        </div>

        @if (settings.useCustomPerWilaya) {
          <div class="max-h-[500px] overflow-y-auto bg-gray-50 p-4">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               @for (wilaya of dataService.wilayas; track wilaya.id) {
                 <div class="bg-white p-3 rounded shadow-sm flex items-center justify-between border border-gray-200">
                    <div class="flex items-center gap-2">
                       <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{{ wilaya.id }}</span>
                       <span class="font-medium">{{ wilaya.name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                       <input 
                         type="number" 
                         [ngModel]="getWilayaPrice(wilaya.id)" 
                         (ngModelChange)="setWilayaPrice(wilaya.id, $event)"
                         class="w-24 p-1 border rounded text-center text-sm focus:ring-emerald-500 outline-none"
                       >
                       <span class="text-xs text-gray-500">د.ج</span>
                    </div>
                 </div>
               }
             </div>
          </div>
        }
      </div>

      <div class="mt-6 flex justify-end">
        <button (click)="save()" class="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-md">
          حفظ التغييرات
        </button>
      </div>
    </div>
  `
})
export class DeliverySettingsComponent {
  dataService = inject(DataService);
  
  settings: DeliverySettings = { ...this.dataService.deliverySettings() };

  getWilayaPrice(id: string): number {
    return this.settings.wilayaPrices[id] !== undefined 
      ? this.settings.wilayaPrices[id] 
      : this.settings.globalPrice;
  }

  setWilayaPrice(id: string, value: number) {
    this.settings.wilayaPrices = { ...this.settings.wilayaPrices, [id]: value };
  }

  save() {
    this.dataService.updateDeliverySettings(this.settings);
    alert('تم حفظ إعدادات التوصيل بنجاح');
  }
}
