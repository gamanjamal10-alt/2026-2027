
import { Component, inject, signal } from '@angular/core';
import { DataService, Product } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-products-manager',
  standalone: true,
  imports: [FormsModule, NgOptimizedImage],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">المنتجات</h1>
      <button (click)="openModal()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
        <span>+</span> إضافة منتج
      </button>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (product of dataService.products(); track product.id) {
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
          <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
             <img [ngSrc]="product.image" width="96" height="96" class="w-full h-full object-cover" alt="Product">
          </div>
          <div class="flex-grow">
             <h3 class="font-bold text-gray-800 mb-1">{{ product.name }}</h3>
             <div class="text-sm text-emerald-600 font-bold mb-2">{{ product.price }} د.ج</div>
             <div class="flex gap-2 mt-auto">
               <button (click)="editProduct(product)" class="text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded hover:bg-blue-100">تعديل</button>
               <button (click)="deleteProduct(product.id)" class="text-red-600 text-sm bg-red-50 px-3 py-1 rounded hover:bg-red-100">حذف</button>
             </div>
          </div>
        </div>
      }
    </div>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <h2 class="text-xl font-bold mb-4">{{ isEditing() ? 'تعديل منتج' : 'إضافة منتج جديد' }}</h2>
          
          <form (ngSubmit)="saveProduct()">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label class="block text-sm font-medium mb-1">اسم المنتج</label>
                 <input type="text" [(ngModel)]="currentProduct.name" name="name" class="w-full p-2 border rounded" required>
               </div>
               <div>
                 <label class="block text-sm font-medium mb-1">الفئة</label>
                 <input type="text" [(ngModel)]="currentProduct.category" name="category" class="w-full p-2 border rounded" required>
               </div>
               <div>
                 <label class="block text-sm font-medium mb-1">السعر</label>
                 <input type="number" [(ngModel)]="currentProduct.price" name="price" class="w-full p-2 border rounded" required>
               </div>
               <div>
                 <label class="block text-sm font-medium mb-1">سعر التخفيض (اختياري)</label>
                 <input type="number" [(ngModel)]="currentProduct.discountPrice" name="discountPrice" class="w-full p-2 border rounded">
               </div>
             </div>

             <div class="mb-4">
               <label class="block text-sm font-medium mb-1">رابط الصورة</label>
               <input type="text" [(ngModel)]="currentProduct.image" name="image" class="w-full p-2 border rounded">
             </div>

             <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                   <label class="block text-sm font-medium">الوصف</label>
                   <button 
                     type="button" 
                     (click)="generateDescription()" 
                     [disabled]="isGenerating() || !currentProduct.name"
                     class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                   >
                     @if (isGenerating()) { <span>...</span> } @else { 
                       <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                       توليد بالذكاء الاصطناعي 
                     }
                   </button>
                </div>
                <textarea [(ngModel)]="currentProduct.description" name="description" rows="4" class="w-full p-2 border rounded"></textarea>
             </div>

             <div class="flex justify-end gap-2">
               <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">إلغاء</button>
               <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700">حفظ</button>
             </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProductsManagerComponent {
  dataService = inject(DataService);
  geminiService = inject(GeminiService);

  isModalOpen = signal(false);
  isEditing = signal(false);
  isGenerating = signal(false);

  defaultProduct: Product = {
    id: '',
    name: '',
    category: '',
    price: 0,
    description: '',
    image: 'https://picsum.photos/300/300',
    stock: 10
  };

  currentProduct: Product = { ...this.defaultProduct };

  openModal() {
    this.isEditing.set(false);
    this.currentProduct = { ...this.defaultProduct, id: Date.now().toString() };
    this.isModalOpen.set(true);
  }

  editProduct(p: Product) {
    this.isEditing.set(true);
    this.currentProduct = { ...p };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  deleteProduct(id: string) {
    if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      this.dataService.deleteProduct(id);
    }
  }

  saveProduct() {
    if (this.isEditing()) {
      this.dataService.updateProduct(this.currentProduct);
    } else {
      this.dataService.addProduct(this.currentProduct);
    }
    this.closeModal();
  }

  async generateDescription() {
    if (!this.currentProduct.name) return;
    this.isGenerating.set(true);
    const desc = await this.geminiService.generateProductDescription(this.currentProduct.name, this.currentProduct.category);
    this.currentProduct.description = desc;
    this.isGenerating.set(false);
  }
}
