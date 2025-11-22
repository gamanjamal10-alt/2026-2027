
import { Component, inject, signal, computed } from '@angular/core';
import { DataService, Product, ProductVideo } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-manager',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">مكتبة الفيديوهات</h1>
      <div class="text-sm text-gray-500">إدارة {{ allVideos().length }} فيديو</div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
       <input 
         type="text" 
         [(ngModel)]="searchQuery" 
         placeholder="بحث باسم الفيديو أو المنتج..." 
         class="flex-grow p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
       >
       <select [(ngModel)]="filterType" class="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
         <option value="all">كل الأنواع</option>
         <option value="file">ملفات مرفوعة</option>
         <option value="link">روابط خارجية</option>
       </select>
    </div>

    <!-- List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <table class="w-full text-sm text-right">
          <thead class="bg-gray-50 text-gray-600 font-medium">
             <tr>
               <th class="p-4">الفيديو</th>
               <th class="p-4">المنتج</th>
               <th class="p-4">النوع</th>
               <th class="p-4">الحجم/المنصة</th>
               <th class="p-4">تحكم</th>
             </tr>
          </thead>
          <tbody>
             @for (item of filteredVideos(); track item.video.id) {
               <tr class="border-b border-gray-50 hover:bg-gray-50">
                 <td class="p-4">
                    <div class="flex items-center gap-3">
                       <div class="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                         ▶
                       </div>
                       <span class="font-bold">{{ item.video.name }}</span>
                    </div>
                 </td>
                 <td class="p-4 text-gray-600">{{ item.productName }}</td>
                 <td class="p-4">
                    <span [class]="item.video.type === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'" class="px-2 py-1 rounded text-xs">
                       {{ item.video.type === 'file' ? 'ملف' : 'رابط' }}
                    </span>
                 </td>
                 <td class="p-4 text-gray-500">
                    {{ item.video.type === 'file' ? item.video.size : item.video.platform }}
                 </td>
                 <td class="p-4">
                    <button (click)="deleteVideo(item.productId, item.video.id)" class="text-red-500 hover:bg-red-50 p-2 rounded transition" title="حذف الفيديو">
                       <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                 </td>
               </tr>
             } @empty {
               <tr>
                 <td colspan="5" class="p-8 text-center text-gray-500">لا توجد فيديوهات مطابقة.</td>
               </tr>
             }
          </tbody>
       </table>
    </div>
  `
})
export class VideoManagerComponent {
  dataService = inject(DataService);
  searchQuery = signal('');
  filterType = signal('all');

  allVideos = computed(() => {
    const list: { video: ProductVideo, productId: string, productName: string }[] = [];
    this.dataService.products().forEach(p => {
      if (p.videos) {
        p.videos.forEach(v => {
          list.push({ video: v, productId: p.id, productName: p.name });
        });
      }
    });
    return list;
  });

  filteredVideos = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const type = this.filterType();
    
    return this.allVideos().filter(item => {
      const matchesSearch = item.video.name.toLowerCase().includes(q) || item.productName.toLowerCase().includes(q);
      const matchesType = type === 'all' || item.video.type === type;
      return matchesSearch && matchesType;
    });
  });

  deleteVideo(productId: string, videoId: string) {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو نهائياً؟')) {
      const product = this.dataService.products().find(p => p.id === productId);
      if (product) {
        const updatedProduct = { 
          ...product, 
          videos: product.videos?.filter(v => v.id !== videoId) 
        };
        this.dataService.updateProduct(updatedProduct);
      }
    }
  }
}
