
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, LandingPage } from '../../services/data.service';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  template: `
    @if (page(); as p) {
      <div class="min-h-screen bg-white font-sans text-gray-800">
        
        @if (p.template === 'modern') {
           <!-- Modern Center Template -->
           <div class="relative overflow-hidden">
              <div class="absolute inset-0 bg-emerald-600 opacity-90 z-0"></div>
              <img [ngSrc]="p.heroImage" fill priority class="object-cover -z-10" alt="Background">
              
              <div class="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center text-white">
                 <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">{{ p.heroTitle }}</h1>
                 <p class="text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-90">{{ p.heroText }}</p>
                 <a [routerLink]="p.ctaLink" class="inline-block bg-white text-emerald-600 text-xl font-bold px-10 py-4 rounded-full shadow-lg hover:scale-105 transition transform">
                    {{ p.ctaText }}
                 </a>
              </div>
           </div>

           <div class="container mx-auto px-4 py-12">
              @if (p.videoUrl && getSafeUrl(p.videoUrl)) {
                <div class="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl aspect-video mb-12">
                   <iframe [src]="getSafeUrl(p.videoUrl!)" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                </div>
              }
              
              <!-- Footer Strip -->
              <div class="text-center text-gray-500 mt-12 border-t pt-8">
                 <p>&copy; 2025 DzShop Store. جميع الحقوق محفوظة.</p>
              </div>
           </div>

        } @else {
           <!-- Classic Template -->
           <header class="bg-white shadow-sm py-4">
              <div class="container mx-auto px-4 flex justify-between items-center">
                 <div class="font-bold text-2xl text-emerald-600">DzShop</div>
                 <a [routerLink]="p.ctaLink" class="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 font-bold">اشترِ الآن</a>
              </div>
           </header>

           <div class="container mx-auto px-4 py-12">
              <div class="flex flex-col md:flex-row items-center gap-10">
                 <div class="md:w-1/2">
                    <h1 class="text-4xl font-bold mb-4 text-gray-900">{{ p.heroTitle }}</h1>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">{{ p.heroText }}</p>
                    <a [routerLink]="p.ctaLink" class="inline-block bg-emerald-600 text-white text-lg font-bold px-8 py-3 rounded shadow hover:bg-emerald-700 transition">
                       {{ p.ctaText }}
                    </a>
                 </div>
                 <div class="md:w-1/2">
                    <div class="rounded-2xl overflow-hidden shadow-xl">
                       <img [ngSrc]="p.heroImage" width="600" height="400" class="w-full h-auto" alt="Hero">
                    </div>
                 </div>
              </div>

              @if (p.videoUrl && getSafeUrl(p.videoUrl)) {
                 <div class="mt-16 max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold text-center mb-6">شاهد الفيديو</h2>
                    <div class="rounded-xl overflow-hidden shadow-lg aspect-video bg-black">
                       <iframe [src]="getSafeUrl(p.videoUrl!)" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                    </div>
                 </div>
              }
           </div>
        }

      </div>
    } @else {
      <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
         <h1 class="text-4xl font-bold text-gray-300 mb-4">404</h1>
         <p class="text-gray-500">الصفحة غير موجودة أو تم إيقافها.</p>
         <a routerLink="/" class="mt-4 text-emerald-600 underline">العودة للرئيسية</a>
      </div>
    }
  `
})
export class LandingPageComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private dataService: DataService = inject(DataService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  page = signal<LandingPage | undefined>(undefined);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
       const slug = params.get('slug');
       if (slug) {
         const found = this.dataService.landingPages().find(p => p.slug === slug && p.isActive);
         if (found) {
           this.page.set(found);
           this.dataService.incrementLandingPageView(found.id);
         }
       }
    });
  }

  getSafeUrl(url: string): SafeResourceUrl | null {
     // Basic YouTube ID extraction
     let videoId = '';
     if (url.includes('youtube.com/watch?v=')) videoId = url.split('v=')[1].split('&')[0];
     else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
     else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];

     if (videoId) {
       return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
     }
     return null;
  }
}
