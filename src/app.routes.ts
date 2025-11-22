
import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './components/shop-layout/shop-layout.component';
import { ProductListComponent } from './components/shop/product-list.component';
import { ProductDetailComponent } from './components/shop/product-detail.component';
import { CartComponent } from './components/shop/cart.component';
import { CheckoutComponent } from './components/shop/checkout.component';
import { TrackingComponent } from './components/shop/tracking.component';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';
import { DashboardComponent } from './components/admin/dashboard.component';
import { ProductsManagerComponent } from './components/admin/products-manager.component';
import { OrdersManagerComponent } from './components/admin/orders-manager.component';
import { AdminLoginComponent } from './components/admin/login.component';

export const routes: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'tracking', component: TrackingComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsManagerComponent },
      { path: 'orders', component: OrdersManagerComponent },
    ]
  },
  { path: 'login', component: AdminLoginComponent },
  { path: '**', redirectTo: '' }
];
