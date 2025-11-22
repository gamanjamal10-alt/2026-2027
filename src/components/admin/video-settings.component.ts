
import { Component, inject, effect } from '@angular/core';
import { DataService, VideoSettings } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">إعدادات الفيديو</h1>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <p class="text-gray-500 mb-6">تحكم في كيفية ظهور وتشغيل الفيديوهات داخل المتجر للزبائن.</p>
        
        <div class="space-y-6">
          <!-- Autoplay -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-800">التشغيل التلقائي (Autoplay)</h3>
              <p class="text-sm text-gray-500">تشغيل الفيديو بمجرد فتح الصفحة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="settings.autoplay" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <!-- Mute -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-800">كتم الصوت تلقائياً</h3>
              <p class="text-sm text-gray-500">بدء الفيديو بدون صوت (مستحسن للمتصفحات)</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="settings.muted" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <!-- Download -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
             <div>
              <h3 class="font-bold text-gray-800">السماح بالتحميل</h3>
              <p class="text-sm text-gray-500">إظهار زر تحميل الفيديو للزبون</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="settings.allowDownload" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

           <!-- Quality -->
           <div class="flex items-center justify-between">
             <div>
              <h3 class="font-bold text-gray-800">جودة العرض الافتراضية</h3>
              <p class="text-sm text-gray-500">الجودة المفضلة عند البدء</p>
            </div>
            <select [(ngModel)]="settings.defaultQuality" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5">
              <option value="auto">تلقائي (Auto)</option>
              <option value="hd">عالية (HD)</option>
              <option value="sd">متوسطة (SD)</option>
            </select>
           </div>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
           <button (click)="save()" class="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
             حفظ الإعدادات
           </button>
        </div>
      </div>
    </div>
  `
})
export class VideoSettingsComponent {
  dataService = inject(DataService);
  
  settings: VideoSettings = { ...this.dataService.videoSettings() };

  save() {
    this.dataService.updateVideoSettings(this.settings);
    alert('تم حفظ إعدادات الفيديو بنجاح');
  }
}
