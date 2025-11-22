
import { Component, inject, signal } from '@angular/core';
import { DataService, Carrier } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carriers-manager',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">شركات الشحن</h1>
      <button (click)="openModal()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
        <span>+</span> إضافة شركة
      </button>
    </div>

    <!-- List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm text-right">
        <thead class="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th class="p-4">اسم الشركة</th>
            <th class="p-4">التغطية</th>
            <th class="p-4">طريقة الربط</th>
            <th class="p-4">ملاحظات</th>
            <th class="p-4">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          @for (carrier of dataService.carriers(); track carrier.id) {
            <tr class="border-b border-gray-50 hover:bg-gray-50">
              <td class="p-4 font-bold">{{ carrier.name }}</td>
              <td class="p-4">
                 @if (carrier.wilayas.length === dataService.wilayas.length) {
                   <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">جميع الولايات (58+)</span>
                 } @else {
                   <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{{ carrier.wilayas.length }} ولاية فقط</span>
                 }
              </td>
              <td class="p-4 uppercase font-mono text-xs">{{ carrier.contactMethod }}</td>
              <td class="p-4 text-gray-500 max-w-xs truncate">{{ carrier.notes }}</td>
              <td class="p-4 flex gap-2">
                <button (click)="editCarrier(carrier)" class="text-blue-500 hover:bg-blue-50 p-1 rounded">تعديل</button>
                <button (click)="deleteCarrier(carrier.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">حذف</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <h2 class="text-xl font-bold mb-4">{{ isEditing() ? 'تعديل شركة شحن' : 'إضافة شركة جديدة' }}</h2>
          
          <form (ngSubmit)="saveCarrier()">
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-1">اسم الشركة</label>
                <input type="text" [(ngModel)]="currentCarrier.name" name="name" class="w-full p-2 border rounded" required>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">طريقة الربط</label>
                <select [(ngModel)]="currentCarrier.contactMethod" name="method" class="w-full p-2 border rounded">
                   <option value="api">API (تلقائي)</option>
                   <option value="email">Email</option>
                   <option value="webhook">Webhook</option>
                   <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-1">الهاتف</label>
                <input type="text" [(ngModel)]="currentCarrier.phone" name="phone" class="w-full p-2 border rounded">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <input type="email" [(ngModel)]="currentCarrier.email" name="email" class="w-full p-2 border rounded">
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">ملاحظات إضافية (API Key, URL...)</label>
              <textarea [(ngModel)]="currentCarrier.notes" name="notes" rows="2" class="w-full p-2 border rounded"></textarea>
            </div>

            <div class="mb-4 border rounded p-3 bg-gray-50">
               <div class="flex justify-between items-center mb-2">
                  <label class="block text-sm font-bold">نطاق التغطية (الولايات)</label>
                  <div class="text-xs space-x-2 rtl:space-x-reverse">
                     <button type="button" (click)="selectAllWilayas()" class="text-blue-600 hover:underline">تحديد الكل</button>
                     <button type="button" (click)="deselectAllWilayas()" class="text-red-600 hover:underline">إلغاء الكل</button>
                  </div>
               </div>
               <div class="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border bg-white rounded">
                  @for (w of dataService.wilayas; track w.id) {
                     <label class="flex items-center gap-1 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="checkbox" [checked]="isWilayaSelected(w.id)" (change)="toggleWilaya(w.id)" class="rounded text-emerald-600 focus:ring-emerald-500">
                        <span>{{w.id}} - {{w.name}}</span>
                     </label>
                  }
               </div>
               <p class="text-xs text-gray-500 mt-1">تم تحديد {{ currentCarrier.wilayas.length }} ولاية.</p>
            </div>

            <div class="flex justify-end gap-2">
               <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">إلغاء</button>
               <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700">حفظ</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class CarriersManagerComponent {
  dataService = inject(DataService);

  isModalOpen = signal(false);
  isEditing = signal(false);

  defaultCarrier: Carrier = {
    id: '',
    name: '',
    wilayas: [],
    contactMethod: 'api'
  };

  currentCarrier: Carrier = { ...this.defaultCarrier };

  openModal() {
    this.isEditing.set(false);
    this.currentCarrier = { 
       ...this.defaultCarrier, 
       id: Date.now().toString(),
       wilayas: this.dataService.wilayas.map(w => w.id) // Default select all
    };
    this.isModalOpen.set(true);
  }

  editCarrier(carrier: Carrier) {
    this.isEditing.set(true);
    this.currentCarrier = { ...carrier, wilayas: [...carrier.wilayas] };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveCarrier() {
    if (this.isEditing()) {
      this.dataService.updateCarrier(this.currentCarrier);
    } else {
      this.dataService.addCarrier(this.currentCarrier);
    }
    this.closeModal();
  }

  deleteCarrier(id: string) {
    if(confirm('حذف شركة الشحن؟')) {
      this.dataService.deleteCarrier(id);
    }
  }

  // Wilaya Selection Logic
  isWilayaSelected(id: string): boolean {
    return this.currentCarrier.wilayas.includes(id);
  }

  toggleWilaya(id: string) {
    if (this.isWilayaSelected(id)) {
      this.currentCarrier.wilayas = this.currentCarrier.wilayas.filter(w => w !== id);
    } else {
      this.currentCarrier.wilayas.push(id);
    }
  }

  selectAllWilayas() {
    this.currentCarrier.wilayas = this.dataService.wilayas.map(w => w.id);
  }

  deselectAllWilayas() {
    this.currentCarrier.wilayas = [];
  }
}
