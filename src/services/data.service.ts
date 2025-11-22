
import { Injectable, signal, computed, effect } from '@angular/core';

export interface ProductVideo {
  id: string;
  type: 'file' | 'link';
  url: string; 
  name: string;
  size?: string;
  platform?: 'youtube' | 'tiktok' | 'vimeo' | 'other';
}

export interface VideoSettings {
  autoplay: boolean;
  muted: boolean;
  allowDownload: boolean;
  defaultQuality: 'auto' | 'hd' | 'sd';
  playerSize: 'normal' | 'large' | 'full';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  stock: number;
  colors?: string[];
  videos?: ProductVideo[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  carrierStatus?: 'sent' | 'transit' | 'delivered' | 'returned';
  date: string;
  trackingCode?: string;
  shippingProvider?: string;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  heroImage: string;
  heroTitle: string;
  heroText: string;
  videoUrl?: string;
  features: string[]; // Simple list of features
  ctaText: string;
  ctaLink: string; // usually /product/:id
  isActive: boolean;
  views: number;
  template: 'modern' | 'classic';
}

export interface DeliverySettings {
  globalPrice: number;
  useCustomPerWilaya: boolean;
  wilayaPrices: Record<string, number>; // { '01': 500, '16': 400 }
}

export interface Wilaya {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // Reference Data
  readonly wilayas: Wilaya[] = [
    { id: '01', name: 'أدرار' }, { id: '02', name: 'الشلف' }, { id: '03', name: 'الأغواط' }, { id: '04', name: 'أم البواقي' },
    { id: '05', name: 'باتنة' }, { id: '06', name: 'بجاية' }, { id: '07', name: 'بسكرة' }, { id: '08', name: 'بشار' },
    { id: '09', name: 'البليدة' }, { id: '10', name: 'البويرة' }, { id: '11', name: 'تمنراست' }, { id: '12', name: 'تبسة' },
    { id: '13', name: 'تلمسان' }, { id: '14', name: 'تيارت' }, { id: '15', name: 'تيزي وزو' }, { id: '16', name: 'الجزائر' },
    { id: '17', name: 'الجلفة' }, { id: '18', name: 'جيجل' }, { id: '19', name: 'سطيف' }, { id: '20', name: 'سعيدة' },
    { id: '21', name: 'سكيكدة' }, { id: '22', name: 'سيدي بلعباس' }, { id: '23', name: 'عنابة' }, { id: '24', name: 'قالمة' },
    { id: '25', name: 'قسنطينة' }, { id: '26', name: 'المدية' }, { id: '27', name: 'مستغانم' }, { id: '28', name: 'المسيلة' },
    { id: '29', name: 'معسكر' }, { id: '30', name: 'ورقلة' }, { id: '31', name: 'وهران' }, { id: '32', name: 'البيض' },
    { id: '33', name: 'إليزي' }, { id: '34', name: 'برج بوعريريج' }, { id: '35', name: 'بومرداس' }, { id: '36', name: 'الطارف' },
    { id: '37', name: 'تندوف' }, { id: '38', name: 'تيسمسيلت' }, { id: '39', name: 'الوادي' }, { id: '40', name: 'خنشلة' },
    { id: '41', name: 'سوق أهراس' }, { id: '42', name: 'تيبازة' }, { id: '43', name: 'ميلة' }, { id: '44', name: 'عين الدفلى' },
    { id: '45', name: 'النعامة' }, { id: '46', name: 'عين تموشنت' }, { id: '47', name: 'غرداية' }, { id: '48', name: 'غليزان' },
    { id: '49', name: 'تيميمون' }, { id: '50', name: 'برج باجي مختار' }, { id: '51', name: 'أولاد جلال' }, { id: '52', name: 'بني عباس' },
    { id: '53', name: 'عين صالح' }, { id: '54', name: 'عين قزام' }, { id: '55', name: 'تقرت' }, { id: '56', name: 'جانت' },
    { id: '57', name: 'المغير' }, { id: '58', name: 'المنيعة' },
    { id: '59', name: 'بوسعادة (مقترح)' }, { id: '60', name: 'بريكة (مقترح)' }, { id: '61', name: 'الشريعة (مقترح)' }, 
    { id: '62', name: 'مسعد (مقترح)' }, { id: '63', name: 'العلمة (مقترح)' }, { id: '64', name: 'عين وسارة (مقترح)' },
    { id: '65', name: 'أفلو (مقترح)' }, { id: '66', name: 'عين البيضاء (مقترح)' }, { id: '67', name: 'تنس (مقترح)' },
    { id: '68', name: 'الأبيض سيدي الشيخ (مقترح)' }, { id: '69', name: 'القرارة (مقترح)' }
  ];

  private initialProducts: Product[] = [
    {
      id: '1',
      name: 'ساعة ذكية الترا',
      description: 'ساعة ذكية مقاومة للماء مع بطارية تدوم طويلاً وتدعم اللغة العربية.',
      price: 4500,
      discountPrice: 3900,
      category: 'إلكترونيات',
      image: 'https://picsum.photos/300/300?random=1',
      stock: 50,
      colors: ['أسود', 'فضي', 'برتقالي'],
      videos: []
    },
    {
      id: '2',
      name: 'سماعات بلوتوث برو',
      description: 'عزل ضوضاء فائق وصوت محيطي 360 درجة.',
      price: 2500,
      category: 'إلكترونيات',
      image: 'https://picsum.photos/300/300?random=2',
      stock: 100,
      colors: ['أبيض']
    },
    {
      id: '3',
      name: 'طقم حقائب سفر',
      description: 'حقائب متينة وعصرية للسفر، 3 قطع بأحجام مختلفة.',
      price: 12000,
      category: 'حقائب',
      image: 'https://picsum.photos/300/300?random=3',
      stock: 20,
      colors: ['أزرق', 'رمادي']
    },
     {
      id: '4',
      name: 'ماكينة حلاقة احترافية',
      description: 'بطارية ليثيوم وشفرات تيتانيوم حادة.',
      price: 3200,
      category: 'عناية شخصية',
      image: 'https://picsum.photos/300/300?random=4',
      stock: 35
    }
  ];

  // Signals
  readonly products = signal<Product[]>(this.initialProducts);
  readonly cart = signal<CartItem[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly landingPages = signal<LandingPage[]>([]);
  readonly deliverySettings = signal<DeliverySettings>({
    globalPrice: 500,
    useCustomPerWilaya: false,
    wilayaPrices: {}
  });
  readonly isAdmin = signal<boolean>(false);
  
  readonly videoSettings = signal<VideoSettings>({
    autoplay: false,
    muted: true,
    allowDownload: false,
    defaultQuality: 'auto',
    playerSize: 'normal'
  });

  // Mock Visitor Data for Analytics (Since no backend)
  readonly visitorStats = signal<{date: string, count: number}[]>([]);

  readonly cartSubtotal = computed(() => {
    return this.cart().reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  });

  readonly cartCount = computed(() => {
    return this.cart().reduce((acc, item) => acc + item.quantity, 0);
  });

  constructor() {
    this.generateMockVisitorData();

    // Load from local storage if available
    if (typeof localStorage !== 'undefined') {
      const storedOrders = localStorage.getItem('dz_orders');
      if (storedOrders) this.orders.set(JSON.parse(storedOrders));
      
      const storedProducts = localStorage.getItem('dz_products');
      if (storedProducts) this.products.set(JSON.parse(storedProducts));

      const storedVideoSettings = localStorage.getItem('dz_video_settings');
      if (storedVideoSettings) this.videoSettings.set(JSON.parse(storedVideoSettings));

      const storedDelivery = localStorage.getItem('dz_delivery_settings');
      if (storedDelivery) this.deliverySettings.set(JSON.parse(storedDelivery));

      const storedLanding = localStorage.getItem('dz_landing_pages');
      if (storedLanding) this.landingPages.set(JSON.parse(storedLanding));
    }

    // Persist changes
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dz_orders', JSON.stringify(this.orders()));
        localStorage.setItem('dz_products', JSON.stringify(this.products()));
        localStorage.setItem('dz_video_settings', JSON.stringify(this.videoSettings()));
        localStorage.setItem('dz_delivery_settings', JSON.stringify(this.deliverySettings()));
        localStorage.setItem('dz_landing_pages', JSON.stringify(this.landingPages()));
      }
    });
  }

  private generateMockVisitorData() {
    // Generate last 30 days of mock data
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 300) + 50 // Random daily visitors between 50 and 350
      });
    }
    this.visitorStats.set(data);
  }

  // Product Actions
  addProduct(product: Product) {
    this.products.update(p => [product, ...p]);
  }

  updateProduct(product: Product) {
    this.products.update(p => p.map(i => i.id === product.id ? product : i));
  }

  deleteProduct(id: string) {
    this.products.update(p => p.filter(i => i.id !== id));
  }

  // Cart Actions
  addToCart(product: Product, quantity: number, color?: string) {
    this.cart.update(items => {
      const existing = items.find(i => i.product.id === product.id && i.selectedColor === color);
      if (existing) {
        return items.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...items, { product, quantity, selectedColor: color }];
    });
  }

  removeFromCart(index: number) {
    this.cart.update(items => items.filter((_, i) => i !== index));
  }

  clearCart() {
    this.cart.set([]);
  }

  // Order Actions
  getShippingPrice(wilayaId: string): number {
    const s = this.deliverySettings();
    if (s.useCustomPerWilaya && s.wilayaPrices[wilayaId] !== undefined) {
      return s.wilayaPrices[wilayaId];
    }
    return s.globalPrice;
  }

  placeOrder(details: { name: string, phone: string, wilayaId: string, wilayaName: string, address: string }) {
    const shippingCost = this.getShippingPrice(details.wilayaId);
    const subtotal = this.cartSubtotal();

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(Math.random() * 1000000),
      customerName: details.name,
      phone: details.phone,
      wilaya: `${details.wilayaId} - ${details.wilayaName}`,
      address: details.address,
      items: [...this.cart()],
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: subtotal + shippingCost,
      status: 'new',
      date: new Date().toISOString()
    };

    this.orders.update(o => [newOrder, ...o]);
    this.clearCart();
    return newOrder.id;
  }

  updateOrderStatus(id: string, status: Order['status'], trackingCode?: string, provider?: string, carrierStatus?: Order['carrierStatus']) {
    this.orders.update(orders => orders.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          status, 
          trackingCode: trackingCode || o.trackingCode,
          shippingProvider: provider || o.shippingProvider,
          carrierStatus: carrierStatus || o.carrierStatus
        };
      }
      return o;
    }));
  }

  // Settings Actions
  updateVideoSettings(settings: VideoSettings) {
    this.videoSettings.set(settings);
  }

  updateDeliverySettings(settings: DeliverySettings) {
    this.deliverySettings.set(settings);
  }

  // Landing Pages Actions
  addLandingPage(page: LandingPage) {
    this.landingPages.update(pages => [page, ...pages]);
  }
  
  updateLandingPage(page: LandingPage) {
    this.landingPages.update(pages => pages.map(p => p.id === page.id ? page : p));
  }

  deleteLandingPage(id: string) {
    this.landingPages.update(pages => pages.filter(p => p.id !== id));
  }

  incrementLandingPageView(id: string) {
    this.landingPages.update(pages => pages.map(p => p.id === id ? { ...p, views: p.views + 1 } : p));
  }

  // Auth
  login(pass: string): boolean {
    if (pass === 'admin123') {
      this.isAdmin.set(true);
      return true;
    }
    return false;
  }
  
  logout() {
    this.isAdmin.set(false);
  }
}
