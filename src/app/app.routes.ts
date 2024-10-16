import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { CartComponent } from './features/cart/cart.component';
import { StoreComponent } from './features/store/store.component';
import { ProductComponent } from './features/product/product.component';
import { AdminComponent } from './features/admin/admin.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { adminGuard, profileGuard } from './services/permission.service';

export const routes: Routes = [
    {path: '', redirectTo: 'store', pathMatch: 'full'},
    {path: 'auth', component: AuthComponent},
    {path: 'store', component: StoreComponent, children: [
        {path: ':product', component: ProductComponent}
    ]},
    {path: 'cart', component: CartComponent},
    {path: 'admin', component: AdminComponent, canActivate: [adminGuard]},
    {path: 'profile', component: ProfileComponent, canActivate: [profileGuard]}
];
