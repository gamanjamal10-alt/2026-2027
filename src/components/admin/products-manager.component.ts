
import { Component, inject, signal } from '@angular/core';
import { DataService, Product, ProductVideo } from '../../services/data.service';
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
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4" [class.opacity-60]="!product.isVisible">
          <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
             @if (product.image.startsWith('data:')) {
                <img [src]="product.image" class="w-full h-full object-cover" alt="Product">
             } @else {
                <img [ngSrc]="product.image" width="96" height="96" class="w-full h-full object-cover" alt="Product">
             }
             @if (!product.isVisible) {
               <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-bold">مخفي</div>
             }
          </div>
          <div class="flex-grow">
             <h3 class="font-bold text-gray-800 mb-1">{{ product.name }}</h3>
             <div class="text-sm text-emerald-600 font-bold mb-2">{{ product.price }} د.ج</div>
             @if (product.videos?.length) {
                <div class="text-xs text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded mb-2">
                  🎥 {{product.videos?.length}} فيديو
                </div>
             }
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
             <!-- Visibility Toggle -->
             <div class="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded border">
                <span class="font-bold text-gray-700">حالة المنتج</span>
                <label class="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" [(ngModel)]="currentProduct.isVisible" name="isVisible" class="w-5 h-5 text-emerald-600 rounded">
                   <span class="text-sm">{{ currentProduct.isVisible ? 'مرئي للزبائن' : 'مخفي' }}</span>
                </label>
             </div>

             <!-- Basic Info -->
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
               <label class="block text-sm font-medium mb-1">صورة المنتج</label>
               <div class="flex gap-2 mb-2 text-sm">
                 <button type="button" (click)="imageInputType='link'" [class]="imageInputType==='link' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'" class="flex-1 py-1 rounded border transition">رابط خارجي</button>
                 <button type="button" (click)="imageInputType='file'" [class]="imageInputType==='file' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'" class="flex-1 py-1 rounded border transition">رفع صورة</button>
               </div>

               @if (imageInputType === 'link') {
                 <input type="text" [(ngModel)]="currentProduct.image" name="image" placeholder="https://..." class="w-full p-2 border rounded">
               } @else {
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition relative">
                    <input type="file" (change)="onImageFileSelected($event)" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="flex flex-col items-center gap-2 text-gray-500">
                       @if (imageUploadProgress > 0 && imageUploadProgress < 100) {
                         <span class="text-emerald-600 font-bold">جارٍ الرفع... {{imageUploadProgress}}%</span>
                       } @else {
                         <span>اضغط لاختيار صورة من جهازك</span>
                       }
                    </div>
                  </div>
               }

               @if (currentProduct.image) {
                 <div class="mt-3 p-2 border rounded bg-gray-50 text-center">
                    <p class="text-xs text-gray-500 mb-1">معاينة:</p>
                    <img [src]="currentProduct.image" class="h-32 mx-auto object-contain rounded bg-white border" alt="Preview">
                 </div>
               }
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
                       توليد بالذكاء الاصطناعي 
                     }
                   </button>
                </div>
                <textarea [(ngModel)]="currentProduct.description" name="description" rows="3" class="w-full p-2 border rounded"></textarea>
             </div>

             <!-- Video Section -->
             <div class="mb-6 border-t pt-4">
               <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                 قسم الفيديوهات
               </h3>
               
               <!-- Add Video Form -->
               <div class="bg-gray-50 p-3 rounded border mb-3">
                  <div class="flex gap-2 mb-2 text-sm">
                    <button type="button" (click)="videoInputType='link'" [class]="videoInputType==='link' ? 'bg-white shadow text-purple-700' : 'text-gray-500'" class="flex-1 py-1 rounded transition">رابط (YouTube/TikTok)</button>
                    <button type="button" (click)="videoInputType='file'" [class]="videoInputType==='file' ? 'bg-white shadow text-purple-700' : 'text-gray-500'" class="flex-1 py-1 rounded transition">رفع ملف (MP4)</button>
                  </div>

                  @if (videoInputType === 'link') {
                    <div class="flex gap-2">
                      <input type="text" [(ngModel)]="newVideoUrl" name="videoUrl" placeholder="https://www.youtube.com/watch?v=..." class="flex-grow p-2 border rounded text-sm">
                      <button type="button" (click)="addVideoLink()" class="bg-purple-600 text-white px-3 rounded text-sm">إضافة</button>
                    </div>
                  } @else {
                    <div class="flex gap-2 items-center">
                      <input type="file" (change)="onFileSelected($event)" accept="video/*" class="flex-grow text-sm">
                    </div>
                    @if (uploadProgress > 0) {
                      <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div class="bg-purple-600 h-1.5 rounded-full" [style.width.%]="uploadProgress"></div>
                      </div>
                    }
                  }
               </div>

               <!-- Video List -->
               @if (currentProduct.videos && currentProduct.videos.length > 0) {
                 <div class="space-y-2">
                   @for (video of currentProduct.videos; track video.id) {
                     <div class="flex items-center justify-between bg-white border p-2 rounded shadow-sm">
                       <div class="flex items-center gap-2 overflow-hidden">
                         <span class="text-sm truncate max-w-[200px]">{{ video.name }}</span>
                         <span class="text-xs text-gray-400 border border-gray-200 px-1 rounded">{{ video.type === 'file' ? 'ملف' : 'رابط' }}</span>
                       </div>
                       <button type="button" (click)="removeVideo(video.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">
                          حذف
                       </button>
                     </div>
                   }
                 </div>
               }
             </div>

             <div class="flex justify-end gap-2 mt-4">
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

  imageInputType: 'link' | 'file' = 'link';
  imageUploadProgress = 0;

  videoInputType: 'link' | 'file' = 'link';
  newVideoUrl = '';
  uploadProgress = 0;

  defaultProduct: Product = {
    id: '',
    name: '',
    category: '',
    price: 0,
    description: '',
    image: 'https://picsum.photos/300/300',
    stock: 10,
    videos: [],
    isVisible: true
  };

  currentProduct: Product = { ...this.defaultProduct };

  openModal() {
    this.isEditing.set(false);
    this.currentProduct = { ...this.defaultProduct, id: Date.now().toString(), videos: [] };
    this.isModalOpen.set(true);
    this.resetForm();
  }

  editProduct(p: Product) {
    this.isEditing.set(true);
    this.currentProduct = { ...p, videos: p.videos ? [...p.videos] : [] };
    this.isModalOpen.set(true);
    this.resetForm();
    
    if (p.image && p.image.startsWith('data:')) {
      this.imageInputType = 'file';
    }
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

  resetForm() {
    this.newVideoUrl = '';
    this.videoInputType = 'link';
    this.uploadProgress = 0;
    this.imageInputType = 'link';
    this.imageUploadProgress = 0;
  }

  onImageFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageUploadProgress = 10;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUploadProgress = 100;
        this.currentProduct.image = e.target.result;
        setTimeout(() => this.imageUploadProgress = 0, 500);
      };
      reader.readAsDataURL(file);
    }
  }

  addVideoLink() {
    if (!this.newVideoUrl) return;
    
    const newVideo: ProductVideo = {
      id: 'VID-' + Date.now(),
      type: 'link',
      url: this.newVideoUrl,
      name: 'فيديو خارجي ' + ((this.currentProduct.videos?.length || 0) + 1),
      platform: 'youtube'
    };

    this.currentProduct.videos = [...(this.currentProduct.videos || []), newVideo];
    this.newVideoUrl = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadProgress = 10;
      const interval = setInterval(() => {
        this.uploadProgress += 20;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          
          const newVideo: ProductVideo = {
            id: 'VID-' + Date.now(),
            type: 'file',
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          };
          
          this.currentProduct.videos = [...(this.currentProduct.videos || []), newVideo];
          this.uploadProgress = 0;
          event.target.value = '';
        }
      }, 300);
    }
  }

  removeVideo(id: string) {
    this.currentProduct.videos = this.currentProduct.videos?.filter(v => v.id !== id);
  }
}
