
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Product, ProductVideo } from '../../services/data.service';
import { NgOptimizedImage, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgOptimizedImage, FormsModule, RouterLink, NgClass],
  template: `
    @if (product(); as p) {
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto mt-6">
        <div class="flex flex-col md:flex-row">
          <!-- Image Side -->
          <div class="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center">
            <img [ngSrc]="p.image" width="500" height="500" priority class="max-w-full h-auto rounded-xl shadow-sm object-contain" alt="{{p.name}}">
          </div>

          <!-- Info Side -->
          <div class="md:w-1/2 p-6 md:p-10 flex flex-col">
            <div class="mb-4">
              <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">{{ p.category }}</span>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ p.name }}</h1>
              <div class="flex items-center gap-3">
                @if (p.discountPrice) {
                  <span class="text-3xl font-bold text-emerald-600">{{ p.discountPrice }} د.ج</span>
                  <span class="text-lg text-gray-400 line-through">{{ p.price }} د.ج</span>
                  <span class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">توفير {{ p.price - p.discountPrice }} د.ج</span>
                } @else {
                  <span class="text-3xl font-bold text-emerald-600">{{ p.price }} د.ج</span>
                }
              </div>
            </div>

            <p class="text-gray-600 leading-relaxed mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {{ p.description }}
            </p>

            <!-- Options -->
            <div class="space-y-4 mb-8">
              @if (p.colors && p.colors.length > 0) {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">اللون:</label>
                  <div class="flex gap-2">
                    @for (color of p.colors; track color) {
                      <button 
                        (click)="selectedColor.set(color)"
                        [class.ring-2]="selectedColor() === color"
                        [class.ring-emerald-500]="selectedColor() === color"
                        class="px-4 py-2 rounded border border-gray-200 bg-white text-sm hover:bg-gray-50 transition"
                      >
                        {{ color }}
                      </button>
                    }
                  </div>
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">الكمية:</label>
                <div class="flex items-center gap-0 max-w-[150px]">
                  <button (click)="changeQty(-1)" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-r flex items-center justify-center font-bold">-</button>
                  <input type="number" [ngModel]="quantity()" readonly class="w-full h-10 text-center border-y border-gray-100 bg-white focus:outline-none">
                  <button (click)="changeQty(1)" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-l flex items-center justify-center font-bold">+</button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-auto space-y-3">
              <button 
                (click)="addToCart(p)" 
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                إضافة للسلة
              </button>
              
              <div class="grid grid-cols-2 gap-3 text-center text-sm text-gray-500">
                 <div class="flex items-center justify-center gap-1 bg-gray-50 py-2 rounded">
                   <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   دفع عند الاستلام
                 </div>
                 <div class="flex items-center justify-center gap-1 bg-gray-50 py-2 rounded">
                   <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   توصيل 58 ولاية
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Section -->
        @if (p.videos && p.videos.length > 0) {
          <div class="border-t border-gray-100 p-6 md:p-10 bg-gray-50">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
               <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               فيديو المنتج
             </h2>
             
             <!-- Player Container -->
             <div class="max-w-3xl mx-auto">
                <div class="relative bg-black rounded-xl overflow-hidden shadow-lg aspect-video mb-4">
                  @if (activeVideo(); as video) {
                     @if (video.type === 'link' && getSafeUrl(video.url)) {
                        <iframe 
                          [src]="getSafeUrl(video.url)" 
                          class="w-full h-full" 
                          frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowfullscreen
                        ></iframe>
                     } @else {
                        <video 
                          [src]="video.url" 
                          class="w-full h-full object-contain" 
                          controls 
                          [autoplay]="dataService.videoSettings().autoplay"
                          [muted]="dataService.videoSettings().muted"
                          [controlsList]="dataService.videoSettings().allowDownload ? '' : 'nodownload'"
                        >
                          متصفحك لا يدعم الفيديو.
                        </video>
                     }
                  }
                </div>

                <!-- Thumbnails / Slider if multiple -->
                @if (p.videos.length > 1) {
                  <div class="flex gap-4 overflow-x-auto pb-2">
                     @for (video of p.videos; track video.id) {
                       <button 
                         (click)="activeVideo.set(video)"
                         [class.ring-2]="activeVideo()?.id === video.id"
                         class="flex-shrink-0 w-24 h-16 bg-gray-200 rounded-lg overflow-hidden relative border-2 border-transparent ring-purple-500 hover:opacity-80 transition"
                       >
                         <!-- Fake thumbnail logic based on type -->
                         <div class="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">
                            {{ video.type === 'file' ? 'MP4' : 'Link' }}
                         </div>
                         <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] truncate px-1">
                           {{ video.name }}
                         </div>
                       </button>
                     }
                  </div>
                }
             </div>
          </div>
        }
      </div>
    } @else {
       <div class="text-center py-20">
         <p class="text-gray-500">المنتج غير موجود</p>
         <a routerLink="/" class="text-emerald-600 underline mt-2 inline-block">عودة للمتجر</a>
       </div>
    }
  `
})
export class ProductDetailComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  dataService = inject(DataService);
  sanitizer = inject(DomSanitizer);

  product = signal<Product | undefined>(undefined);
  quantity = signal(1);
  selectedColor = signal<string | undefined>(undefined);
  activeVideo = signal<ProductVideo | null>(null);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.dataService.products().find(p => p.id === id);
        this.product.set(found);
        if (found?.colors?.length) {
          this.selectedColor.set(found.colors[0]);
        }
        if (found?.videos?.length) {
          this.activeVideo.set(found.videos[0]);
        }
      }
    });
  }

  changeQty(delta: number) {
    const newQ = this.quantity() + delta;
    if (newQ >= 1) this.quantity.set(newQ);
  }

  addToCart(p: Product) {
    this.dataService.addToCart(p, this.quantity(), this.selectedColor());
    alert('تمت الإضافة للسلة بنجاح!');
  }

  getSafeUrl(url: string): SafeResourceUrl | null {
    // Simple check for YouTube to embed correctly
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
       let videoId = '';
       if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
       else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
       
       if (videoId) {
          const params = this.dataService.videoSettings().autoplay ? '?autoplay=1&mute=1' : '';
          return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}${params}`);
       }
    }
    // Fallback for other iframes or direct links might need more complex logic
    return null;
  }
}
