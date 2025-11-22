
import { Component, inject, signal } from '@angular/core';
import { DataService, LandingPage } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-pages-manager',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">صفحات الهبوط (Landing Pages)</h1>
      <button (click)="openModal()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
        <span>+</span> صفحة جديدة
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm text-right">
        <thead class="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th class="p-4">العنوان</th>
            <th class="p-4">الرابط (Slug)</th>
            <th class="p-4">الزيارات</th>
            <th class="p-4">الحالة</th>
            <th class="p-4">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          @for (page of dataService.landingPages(); track page.id) {
            <tr class="border-b border-gray-50 hover:bg-gray-50">
              <td class="p-4 font-bold">{{ page.title }}</td>
              <td class="p-4 text-blue-600 dir-ltr text-right font-mono text-xs">
                 <a [routerLink]="['/promo', page.slug]" target="_blank" class="hover:underline">/promo/{{ page.slug }}</a>
              </td>
              <td class="p-4">{{ page.views }}</td>
              <td class="p-4">
                <span [class]="page.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded text-xs">
                  {{ page.isActive ? 'نشط' : 'مسودة' }}
                </span>
              </td>
              <td class="p-4 flex gap-2">
                <button (click)="copyLink(page.slug)" class="text-gray-500 hover:bg-gray-100 p-1 rounded" title="نسخ الرابط">🔗</button>
                <button (click)="editPage(page)" class="text-blue-500 hover:bg-blue-50 p-1 rounded">تعديل</button>
                <button (click)="deletePage(page.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">حذف</button>
              </td>
            </tr>
          } @empty {
             <tr><td colspan="5" class="p-8 text-center text-gray-500">لا توجد صفحات هبوط حالياً.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
           <h2 class="text-xl font-bold mb-4">{{ isEditing() ? 'تعديل صفحة' : 'إنشاء صفحة هبوط' }}</h2>
           
           <form (ngSubmit)="savePage()">
              <div class="grid md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label class="block text-sm font-medium mb-1">عنوان الصفحة (داخلي)</label>
                   <input type="text" [(ngModel)]="currentPage.title" name="title" class="w-full p-2 border rounded" required>
                 </div>
                 <div>
                   <label class="block text-sm font-medium mb-1">الرابط (Slug)</label>
                   <input type="text" [(ngModel)]="currentPage.slug" name="slug" class="w-full p-2 border rounded" placeholder="ex: black-friday-offer" required>
                 </div>
              </div>

              <div class="mb-4">
                 <label class="block text-sm font-medium mb-1">القالب</label>
                 <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer border p-3 rounded flex-1" [class.border-emerald-500]="currentPage.template === 'modern'">
                      <input type="radio" [(ngModel)]="currentPage.template" name="template" value="modern" class="text-emerald-600">
                      <span>Modern (مركز)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer border p-3 rounded flex-1" [class.border-emerald-500]="currentPage.template === 'classic'">
                      <input type="radio" [(ngModel)]="currentPage.template" name="template" value="classic" class="text-emerald-600">
                      <span>Classic (صورة ونص)</span>
                    </label>
                 </div>
              </div>

              <div class="mb-4">
                 <label class="block text-sm font-medium mb-1">عنوان الهيرو (Hero Title)</label>
                 <input type="text" [(ngModel)]="currentPage.heroTitle" name="heroTitle" class="w-full p-2 border rounded">
              </div>
              
              <div class="mb-4">
                 <label class="block text-sm font-medium mb-1">النص الرئيسي</label>
                 <textarea [(ngModel)]="currentPage.heroText" name="heroText" rows="3" class="w-full p-2 border rounded"></textarea>
              </div>

              <div class="mb-4">
                 <label class="block text-sm font-medium mb-1">صورة (رابط)</label>
                 <input type="text" [(ngModel)]="currentPage.heroImage" name="heroImage" class="w-full p-2 border rounded">
              </div>

              <div class="mb-4">
                 <label class="block text-sm font-medium mb-1">فيديو (YouTube Embed URL) - اختياري</label>
                 <input type="text" [(ngModel)]="currentPage.videoUrl" name="videoUrl" class="w-full p-2 border rounded">
              </div>

              <div class="grid md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded">
                 <div>
                    <label class="block text-sm font-medium mb-1">نص الزر (CTA)</label>
                    <input type="text" [(ngModel)]="currentPage.ctaText" name="ctaText" class="w-full p-2 border rounded">
                 </div>
                 <div>
                    <label class="block text-sm font-medium mb-1">رابط الزر</label>
                    <input type="text" [(ngModel)]="currentPage.ctaLink" name="ctaLink" class="w-full p-2 border rounded" placeholder="/product/1">
                 </div>
              </div>

              <div class="mb-6">
                 <label class="flex items-center gap-2">
                   <input type="checkbox" [(ngModel)]="currentPage.isActive" name="isActive" class="w-5 h-5 text-emerald-600">
                   <span class="font-medium">تفعيل الصفحة (نشرها للعامة)</span>
                 </label>
              </div>

              <div class="flex justify-end gap-2">
                 <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">إلغاء</button>
                 <button type="submit" class="px-6 py-2 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700">حفظ</button>
              </div>
           </form>
        </div>
      </div>
    }
  `
})
export class LandingPagesManagerComponent {
  dataService = inject(DataService);
  
  isModalOpen = signal(false);
  isEditing = signal(false);

  defaultPage: LandingPage = {
    id: '',
    title: '',
    slug: '',
    heroImage: 'https://picsum.photos/800/400',
    heroTitle: 'عرض حصري لفترة محدودة!',
    heroText: 'اكتشف أفضل المنتجات بأسعار لا تفوت.',
    features: [],
    ctaText: 'اطلب الآن',
    ctaLink: '/',
    isActive: true,
    views: 0,
    template: 'modern'
  };

  currentPage: LandingPage = { ...this.defaultPage };

  openModal() {
    this.isEditing.set(false);
    this.currentPage = { ...this.defaultPage, id: Date.now().toString() };
    this.isModalOpen.set(true);
  }

  editPage(page: LandingPage) {
    this.isEditing.set(true);
    this.currentPage = { ...page };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  savePage() {
    if (this.isEditing()) {
      this.dataService.updateLandingPage(this.currentPage);
    } else {
      this.dataService.addLandingPage(this.currentPage);
    }
    this.closeModal();
  }

  deletePage(id: string) {
    if(confirm('حذف الصفحة؟')) {
      this.dataService.deleteLandingPage(id);
    }
  }

  copyLink(slug: string) {
    const url = `${window.location.origin}/#/promo/${slug}`;
    navigator.clipboard.writeText(url).then(() => alert('تم نسخ الرابط'));
  }
}
