
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (dataService.isAdmin()) {
      <div class="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-900 text-white hidden md:flex flex-col flex-shrink-0">
          <div class="p-6 bg-gray-800">
            <h2 class="text-2xl font-bold text-emerald-400">DzShop Admin</h2>
            <p class="text-xs text-gray-400 mt-1">لوحة التحكم 2025</p>
          </div>
          
          <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
            <a routerLink="/admin/dashboard" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              لوحة القيادة
            </a>
            <a routerLink="/admin/analytics" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              الإحصائيات
            </a>
            <a routerLink="/admin/products" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              المنتجات
            </a>
            <a routerLink="/admin/orders" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <div class="relative">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                @if (newOrdersCount() > 0) {
                  <span class="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{{ newOrdersCount() }}</span>
                }
              </div>
              الطلبات
            </a>
            
            <div class="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">إدارة متقدمة</div>

             <a routerLink="/admin/delivery" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
              أسعار التوصيل
            </a>

             <a routerLink="/admin/landing-pages" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              صفحات الهبوط
            </a>

            <div class="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">إدارة المحتوى</div>
            
            <a routerLink="/admin/videos" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              مكتبة الفيديوهات
            </a>
            
            <a routerLink="/admin/video-settings" routerLinkActive="bg-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              إعدادات الفيديو
            </a>
          </nav>

          <div class="p-4 border-t border-gray-800">
            <button (click)="logout()" class="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              تسجيل الخروج
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-grow overflow-y-auto h-screen">
           <!-- Mobile Header -->
           <div class="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
             <h2 class="font-bold">DzShop Admin</h2>
             <div class="flex gap-4">
                <a routerLink="/admin/dashboard">الرئيسية</a>
                <a routerLink="/admin/orders">الطلبات</a>
                <button (click)="logout()">خروج</button>
             </div>
           </div>
           <div class="p-6">
             <router-outlet></router-outlet>
           </div>
        </main>
      </div>
    } @else {
      <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <p>جارٍ التحويل...</p>
      </div>
    }
  `
})
export class AdminLayoutComponent {
  dataService = inject(DataService);
  router: Router = inject(Router);

  constructor() {
    if (!this.dataService.isAdmin()) {
      this.router.navigate(['/login']);
    }
  }

  newOrdersCount = () => this.dataService.orders().filter(o => o.status === 'new').length;

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}
