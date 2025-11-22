
import { Component, inject, signal } from '@angular/core';
import { DataService, Product, ProductVideo } from '../../services/data.service';
import { GeminiService } from '../../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage, NgClass } from '@angular/common';

@Component({
  selector: 'app-products-manager',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">المنتجات</h1>
      <button (click)="openModal()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow">
        <span>+</span> إضافة منتج
      </button>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-right">
          <thead class="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th class="p-4">الصورة</th>
              <th class="p-4">اسم المنتج</th>
              <th class="p-4">السعر</th>
              <th class="p-4">المخزون</th>
              <th class="p-4">الحالة</th>
              <th class="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (product of dataService.products(); track product.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
                <td class="p-4">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img [src]="product.image" class="w-full h-full object-cover" alt="Product">
                  </div>
                </td>
                <td class="p-4 font-medium text-gray-900">
                   {{ product.name }}
                   <div class="text-xs text-gray-500">{{ product.category }}</div>
                </td>
                <td class="p-4 font-bold text-emerald-600">{{ product.price }} د.ج</td>
                <td class="p-4">
                  <span [class]="product.stock > 10 ? 'text-green-600' : 'text-red-600'" class="font-bold">
                    {{ product.stock }}
                  </span>
                </td>
                <td class="p-4">
                   <button 
                     (click)="toggleVisibility(product)"
                     [class]="product.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                     class="px-3 py-1 rounded-full text-xs font-bold transition hover:opacity-80"
                   >
                     {{ product.isVisible ? 'ظاهر' : 'مخفي' }}
                   </button>
                </td>
                <td class="p-4 flex gap-2">
                  <button (click)="editProduct(product)" class="text-blue-500 hover:bg-blue-50 p-2 rounded transition">تعديل</button>
                  <button (click)="deleteProduct(product.id)" class="text-red-500 hover:bg-red-50 p-2 rounded transition">حذف</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="p-8 text-center text-gray-500">لا توجد منتجات حالياً.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 class="text-xl font-bold text-gray-800">{{ isEditing() ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-6">
            <form (ngSubmit)="saveProduct()">
              
              <div class="grid md:grid-cols-2 gap-8">
                <!-- Left Column: Basic Info -->
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                    <input type="text" [(ngModel)]="currentProduct.name" name="name" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" required>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                    <select [(ngModel)]="currentProduct.category" name="category" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition">
                      <option value="إلكترونيات">إلكترونيات</option>
                      <option value="ملابس">ملابس</option>
                      <option value="منزل">منزل</option>
                      <option value="عناية شخصية">عناية شخصية</option>
                      <option value="حقائب">حقائب</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">السعر (د.ج)</label>
                      <input type="number" [(ngModel)]="currentProduct.price" name="price" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" required>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">سعر التخفيض (اختياري)</label>
                      <input type="number" [(ngModel)]="currentProduct.discountPrice" name="discountPrice" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                    <input type="number" [(ngModel)]="currentProduct.stock" name="stock" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" required>
                  </div>

                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="block text-sm font-medium text-gray-700">الوصف</label>
                      <button type="button" (click)="generateDescription()" [disabled]="isGeneratingDesc()" class="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50">
                        @if (isGeneratingDesc()) {
                           <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        } @else {
                           ✨ توليد بالذكاء الاصطناعي
                        }
                      </button>
                    </div>
                    <textarea [(ngModel)]="currentProduct.description" name="description" rows="4" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" required></textarea>
                  </div>
                  
                  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <div class="relative inline-flex items-center">
                        <input type="checkbox" [(ngModel)]="currentProduct.isVisible" name="isVisible" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                      <span class="text-sm font-medium text-gray-700">المنتج ظاهر في المتجر</span>
                    </label>
                  </div>
                </div>

                <!-- Right Column: Media & Variants -->
                <div class="space-y-6">
                  
                  <!-- Image Upload Section -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">صورة المنتج الرئيسية</label>
                    
                    <div class="flex gap-4 mb-2 text-sm">
                      <button type="button" (click)="imageMode.set('upload')" [class]="imageMode() === 'upload' ? 'text-emerald-600 border-b-2 border-emerald-600 font-bold' : 'text-gray-500'">رفع صورة</button>
                      <button type="button" (click)="imageMode.set('url')" [class]="imageMode() === 'url' ? 'text-emerald-600 border-b-2 border-emerald-600 font-bold' : 'text-gray-500'">رابط خارجي</button>
                    </div>

                    @if (imageMode() === 'upload') {
                      <div 
                        class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative group"
                        (click)="fileInput.click()"
                      >
                        <input 
                          #fileInput 
                          type="file" 
                          (change)="onFileSelected($event)" 
                          accept="image/*" 
                          class="hidden"
                        >
                        @if (currentProduct.image && currentProduct.image.startsWith('data:')) {
                           <img [src]="currentProduct.image" class="mx-auto h-40 object-contain mb-2 rounded shadow-sm">
                           <p class="text-xs text-gray-500">انقر لتغيير الصورة</p>
                        } @else {
                           <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           <p class="text-sm text-gray-600 font-medium">اضغط هنا لرفع صورة</p>
                           <p class="text-xs text-gray-400">PNG, JPG, WEBP (Max 2MB)</p>
                        }
                      </div>
                    } @else {
                      <input type="text" [(ngModel)]="currentProduct.image" name="image" placeholder="https://example.com/image.jpg" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                      @if(currentProduct.image && !currentProduct.image.startsWith('data:')) {
                        <div class="mt-2 h-40 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                           <img [src]="currentProduct.image" class="w-full h-full object-contain" alt="Preview">
                        </div>
                      }
                    }
                  </div>

                  <!-- Colors -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">الألوان المتاحة</label>
                    <div class="flex gap-2 mb-2">
                      <input #colorInput type="text" placeholder="أضف لون (مثلاً: أحمر)" class="flex-grow p-2 border border-gray-200 rounded-lg text-sm outline-none" (keydown.enter)="addColor(colorInput.value); colorInput.value = ''; $event.preventDefault()">
                      <button type="button" (click)="addColor(colorInput.value); colorInput.value = ''" class="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700">+</button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      @for (color of currentProduct.colors; track color) {
                        <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {{ color }}
                          <button type="button" (click)="removeColor(color)" class="text-gray-400 hover:text-red-500 font-bold">×</button>
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Videos Section -->
                  <div class="border-t border-gray-100 pt-4">
                    <h3 class="font-bold text-sm text-gray-800 mb-3">الفيديوهات</h3>
                    
                    <!-- Current Videos List -->
                    <div class="space-y-2 mb-4">
                       @for (video of currentProduct.videos; track video.id) {
                         <div class="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                            <div class="flex items-center gap-2 truncate">
                               <span class="text-xs bg-gray-200 px-1 rounded">{{ video.type === 'file' ? 'File' : 'Link' }}</span>
                               <span class="truncate max-w-[150px]">{{ video.name }}</span>
                            </div>
                            <button type="button" (click)="removeVideo(video.id)" class="text-red-500 hover:bg-red-100 p-1 rounded">حذف</button>
                         </div>
                       }
                    </div>

                    <!-- Add Video UI -->
                    <div class="bg-gray-50 p-3 rounded border border-gray-200">
                       <div class="flex gap-2 mb-2 text-xs">
                          <button type="button" (click)="videoMode.set('link')" [class.font-bold]="videoMode() === 'link'" [class.text-emerald-600]="videoMode() === 'link'">رابط</button>
                          <span class="text-gray-300">|</span>
                          <button type="button" (click)="videoMode.set('file')" [class.font-bold]="videoMode() === 'file'" [class.text-emerald-600]="videoMode() === 'file'">رفع ملف</button>
                       </div>
                       
                       @if (videoMode() === 'link') {
                          <input #videoLinkInput type="text" placeholder="رابط يوتيوب / تيك توك" class="w-full p-2 border rounded text-sm mb-2 outline-none">
                          <button type="button" (click)="addVideoLink(videoLinkInput.value); videoLinkInput.value=''" class="w-full bg-blue-600 text-white py-1 rounded text-sm">إضافة الرابط</button>
                       } @else {
                          <input #videoFileInput type="file" accept="video/*" class="w-full text-xs mb-2">
                          <button type="button" (click)="addVideoFile(videoFileInput)" class="w-full bg-blue-600 text-white py-1 rounded text-sm">رفع الفيديو</button>
                       }
                    </div>
                  </div>

                </div>
              </div>

              <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" (click)="closeModal()" class="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">إلغاء</button>
                <button type="submit" class="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                  {{ isEditing() ? 'حفظ التعديلات' : 'إضافة المنتج' }}
                </button>
              </div>

            </form>
          </div>
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
  isGeneratingDesc = signal(false);
  
  // UI Modes
  imageMode = signal<'upload' | 'url'>('upload');
  videoMode = signal<'link' | 'file'>('link');

  defaultProduct: Product = {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'إلكترونيات',
    image: '',
    stock: 0,
    colors: [],
    videos: [],
    isVisible: true
  };

  currentProduct: Product = { ...this.defaultProduct };

  openModal() {
    this.isEditing.set(false);
    this.currentProduct = { ...this.defaultProduct, id: Date.now().toString() };
    this.imageMode.set('upload'); // Default
    this.isModalOpen.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    // Clone to avoid direct mutation before save
    this.currentProduct = { 
      ...product, 
      colors: [...(product.colors || [])],
      videos: [...(product.videos || [])]
    };
    
    // Detect image type
    if (this.currentProduct.image.startsWith('data:')) {
      this.imageMode.set('upload');
    } else {
      this.imageMode.set('url');
    }
    
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveProduct() {
    if (this.isEditing()) {
      this.dataService.updateProduct(this.currentProduct);
    } else {
      this.dataService.addProduct(this.currentProduct);
    }
    this.closeModal();
  }

  deleteProduct(id: string) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      this.dataService.deleteProduct(id);
    }
  }
  
  toggleVisibility(product: Product) {
     const updated = { ...product, isVisible: !product.isVisible };
     this.dataService.updateProduct(updated);
  }

  // Colors
  addColor(color: string) {
    if (color.trim()) {
      if (!this.currentProduct.colors) this.currentProduct.colors = [];
      this.currentProduct.colors.push(color.trim());
    }
  }

  removeColor(color: string) {
    this.currentProduct.colors = this.currentProduct.colors?.filter(c => c !== color);
  }

  // AI Description
  async generateDescription() {
    if (!this.currentProduct.name) {
      alert('أدخل اسم المنتج أولاً');
      return;
    }
    this.isGeneratingDesc.set(true);
    const desc = await this.geminiService.generateProductDescription(
      this.currentProduct.name, 
      this.currentProduct.category
    );
    this.currentProduct.description = desc;
    this.isGeneratingDesc.set(false);
  }

  // Image Handling
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
         alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.');
         return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentProduct.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Video Handling
  addVideoLink(url: string) {
     if (!url) return;
     const newVideo: ProductVideo = {
        id: Date.now().toString(),
        type: 'link',
        url: url,
        name: 'فيديو خارجي',
        platform: url.includes('youtube') ? 'youtube' : 'other'
     };
     this.currentProduct.videos = [...(this.currentProduct.videos || []), newVideo];
  }

  addVideoFile(input: HTMLInputElement) {
     const file = input.files?.[0];
     if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for demo
           alert('الفيديو كبير جداً للعرض التوضيحي (الحد الأقصى 10 ميجا).');
           return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
           const newVideo: ProductVideo = {
              id: Date.now().toString(),
              type: 'file',
              url: e.target.result,
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
           };
           this.currentProduct.videos = [...(this.currentProduct.videos || []), newVideo];
           input.value = ''; // reset
        };
        reader.readAsDataURL(file);
     }
  }

  removeVideo(id: string) {
     this.currentProduct.videos = this.currentProduct.videos?.filter(v => v.id !== id);
  }
}
