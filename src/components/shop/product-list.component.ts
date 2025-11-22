
import { Component, inject, signal, computed } from '@angular/core';
import { DataService, Product } from '../../services/data.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NgOptimizedImage],
  template: `
    <!-- Hero Banner -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
      <div class="relative z-10">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">تخفيضات الموسم الجديد!</h1>
        <p class="text-emerald-100 text-lg mb-6">أفضل المنتجات بأسعار لا تقبل المنافسة والدفع عند الاستلام.</p>
        <button (click)="scrollToProducts()" class="bg-white text-emerald-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-md">
          تسوق الآن
        </button>
      </div>
      <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
        <svg class="w-64 h-64" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
      </div>
    </div>

    <!-- Filters & Search -->
    <div id="products" class="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div class="relative w-full md:w-1/3">
        <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          placeholder="ابحث عن منتج..." 
          class="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
      </div>
      
      <div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
        <button 
          (click)="setCategory('all')" 
          [class]="selectedCategory() === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
        >
          الكل
        </button>
        @for (cat of categories(); track cat) {
          <button 
            (click)="setCategory(cat)" 
            [class]="selectedCategory() === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
          >
            {{ cat }}
          </button>
        }
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      @for (product of filteredProducts(); track product.id) {
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group flex flex-col">
          <div class="relative aspect-[1/1] bg-gray-100 overflow-hidden">
             @if (product.image.startsWith('data:')) {
               <img [src]="product.image" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="{{product.name}}">
             } @else {
               <img [ngSrc]="product.image" width="300" height="300" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="{{product.name}}">
             }
             @if (product.discountPrice) {
               <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                 تخفيض
               </div>
             }
          </div>
          
          <div class="p-4 flex-grow flex flex-col">
            <div class="text-xs text-gray-500 mb-1">{{ product.category }}</div>
            <h3 class="font-bold text-gray-800 mb-2 leading-tight line-clamp-2">{{ product.name }}</h3>
            
            <div class="mt-auto">
              <div class="flex items-end gap-2 mb-3">
                @if (product.discountPrice) {
                  <span class="text-emerald-600 font-bold text-lg">{{ product.discountPrice }} د.ج</span>
                  <span class="text-gray-400 text-sm line-through">{{ product.price }} د.ج</span>
                } @else {
                  <span class="text-emerald-600 font-bold text-lg">{{ product.price }} د.ج</span>
                }
              </div>
              
              <a [routerLink]="['/product', product.id]" class="block w-full text-center bg-gray-900 hover:bg-emerald-600 text-white py-2 rounded-lg transition font-medium text-sm">
                مشاهدة التفاصيل
              </a>
            </div>
          </div>
        </div>
      } @empty {
        <div class="col-span-full text-center py-12 text-gray-500">
          لا توجد منتجات مطابقة لبحثك.
        </div>
      }
    </div>
  `
})
export class ProductListComponent {
  dataService = inject(DataService);
  
  searchQuery = signal('');
  selectedCategory = signal('all');

  categories = computed(() => {
    // Only consider categories of visible products
    const cats = new Set(this.dataService.products()
      .filter(p => p.isVisible)
      .map(p => p.category));
    return Array.from(cats);
  });

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    
    return this.dataService.products().filter(p => {
      // MUST be visible
      if (!p.isVisible) return false;

      const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || p.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
}
