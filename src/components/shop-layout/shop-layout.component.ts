
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            DzShop
          </a>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center gap-6">
            <a routerLink="/" routerLinkActive="text-emerald-600 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-emerald-500 transition">الرئيسية</a>
            <a routerLink="/tracking" routerLinkActive="text-emerald-600 font-semibold" class="hover:text-emerald-500 transition">تتبع الطلب</a>
            <a routerLink="/admin" class="text-gray-400 hover:text-gray-600 text-sm">دخول الإدارة</a>
          </nav>

          <!-- Cart Icon -->
          <a routerLink="/cart" class="relative p-2 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (dataService.cartCount() > 0) {
              <span class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {{ dataService.cartCount() }}
              </span>
            }
          </a>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-grow container mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 text-gray-300 py-8 mt-auto">
        <div class="container mx-auto px-4 text-center">
          <p class="mb-2">جميع الحقوق محفوظة &copy; 2025 DzShop Pro</p>
          <div class="flex justify-center gap-4 text-sm">
            <a href="#" class="hover:text-white">سياسة الخصوصية</a>
            <a href="#" class="hover:text-white">الشروط والأحكام</a>
            <a href="#" class="hover:text-white">اتصل بنا</a>
          </div>
          <p class="text-xs text-gray-500 mt-4">التوصيل متوفر لـ 58 ولاية</p>
        </div>
      </footer>
    </div>
  `
})
export class ShopLayoutComponent {
  dataService = inject(DataService);
}
