
import { Injectable, signal, computed, effect } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number; // Optional discount
  category: string;
  image: string;
  stock: number;
  colors?: string[];
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
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  date: string;
  trackingCode?: string;
  shippingProvider?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // Initial Mock Data
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
      colors: ['أسود', 'فضي', 'برتقالي']
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
  readonly isAdmin = signal<boolean>(false);

  readonly cartTotal = computed(() => {
    return this.cart().reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  });

  readonly cartCount = computed(() => {
    return this.cart().reduce((acc, item) => acc + item.quantity, 0);
  });

  constructor() {
    // Load from local storage if available
    const storedOrders = localStorage.getItem('dz_orders');
    if (storedOrders) {
      this.orders.set(JSON.parse(storedOrders));
    }
    
    const storedProducts = localStorage.getItem('dz_products');
    if (storedProducts) {
        this.products.set(JSON.parse(storedProducts));
    }

    // Persist changes
    effect(() => {
      localStorage.setItem('dz_orders', JSON.stringify(this.orders()));
    });
     effect(() => {
      localStorage.setItem('dz_products', JSON.stringify(this.products()));
    });
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
  placeOrder(details: { name: string, phone: string, wilaya: string, address: string }) {
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(Math.random() * 1000000),
      customerName: details.name,
      phone: details.phone,
      wilaya: details.wilaya,
      address: details.address,
      items: [...this.cart()],
      total: this.cartTotal(),
      status: 'new',
      date: new Date().toISOString()
    };

    this.orders.update(o => [newOrder, ...o]);
    this.clearCart();
    return newOrder.id;
  }

  updateOrderStatus(id: string, status: Order['status'], trackingCode?: string, provider?: string) {
    this.orders.update(orders => orders.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          status, 
          trackingCode: trackingCode || o.trackingCode,
          shippingProvider: provider || o.shippingProvider 
        };
      }
      return o;
    }));
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
