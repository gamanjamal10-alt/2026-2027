
import { Component, inject, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">مدير المتجر</h2>
        <form (ngSubmit)="login()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="********"
            >
          </div>
          @if (error()) {
            <p class="text-red-500 text-sm mb-4">كلمة المرور غير صحيحة (جرب admin123)</p>
          }
          <button type="submit" class="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
            دخول
          </button>
        </form>
        <div class="mt-4 text-center">
            <a href="/" class="text-sm text-gray-500 hover:underline">العودة للمتجر</a>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  dataService = inject(DataService);
  router = inject(Router);
  password = signal('');
  error = signal(false);

  login() {
    if (this.dataService.login(this.password())) {
      this.router.navigate(['/admin']);
    } else {
      this.error.set(true);
    }
  }
}
