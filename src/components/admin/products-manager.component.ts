
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
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
          <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
             @if (product.image.startsWith('data:')) {
                <img [src]="product.image" class="w-full h-full object-cover" alt="Product">
             } @else {
                <img [ngSrc]="product.image" width="96" height="96" class="w-full h-full object-cover" alt="Product">
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
                       <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
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
                       <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                       توليد بالذكاء الاصطناعي 
                     }
                   </button>
                </div>
                <textarea [(ngModel)]="currentProduct.description" name="description" rows="3" class="w-full p-2 border rounded"></textarea>
             </div>

             <!-- Video Section -->
             <div class="mb-6 border-t pt-4">
               <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2">
                 <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
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
                         <span class="bg-gray-100 p-1 rounded">
                           <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         </span>
                         <span class="text-sm truncate max-w-[200px]">{{ video.name }}</span>
                         <span class="text-xs text-gray-400 border border-gray-200 px-1 rounded">{{ video.type === 'file' ? 'ملف' : 'رابط' }}</span>
                       </div>
                       <button type="button" (click)="removeVideo(video.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">
                         <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                     </div>
                   }
                 </div>
               } @else {
                 <p class="text-gray-400 text-xs text-center py-2">لا توجد فيديوهات مضافة</p>
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

  // Image UI State
  imageInputType: 'link' | 'file' = 'link';
  imageUploadProgress = 0;

  // Video UI State
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
    videos: []
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
    
    // Auto-detect image type
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
    this.resetVideoForm();
    this.imageInputType = 'link';
    this.imageUploadProgress = 0;
  }

  // Image Logic
  onImageFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageUploadProgress = 10;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUploadProgress = 100;
        this.currentProduct.image = e.target.result; // Base64 string
        setTimeout(() => this.imageUploadProgress = 0, 500);
      };
      reader.readAsDataURL(file);
    }
  }

  // Video Logic
  resetVideoForm() {
    this.newVideoUrl = '';
    this.videoInputType = 'link';
    this.uploadProgress = 0;
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
            url: URL.createObjectURL(file), // Temporary blob URL for demo
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
