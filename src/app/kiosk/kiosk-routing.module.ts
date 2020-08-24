import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SsoComponent } from './sso/sso.component';

const routes: Routes = [
  {
    path: 'kiosk',
    // component: LayoutComponent,
    // canActivate: [AuthGuardService],
    children: [
      { path: 'main', component: MainComponent },
      { path: 'sso', component: SsoComponent },
      { path: '', redirectTo: 'main', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KioskRoutingModule { }
