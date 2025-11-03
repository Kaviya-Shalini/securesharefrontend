import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard';
import { RegisterComponent } from './register/register';
import { VerifyOtpComponent } from './verify-otp/verify-otp';
import { ForgotPasswordComponent } from './forgotpassword/forgotpassword';
import { ForgotUsernameComponent } from './find-username/find-username';
import { UploadComponent } from './upload/upload';
import { MyWalletComponent } from './mywallet/mywallet';
import { ReceivedFilesComponent } from './receivedfiles/receivedfiles';
import { SharedFilesComponent } from './sharedfiles/sharedfiles';
import { Share } from './share/share';
import { AuthGuard } from './auth.guard';
export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'forgot-username', component: ForgotUsernameComponent },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'mywallet', component: MyWalletComponent, canActivate: [AuthGuard] },
  { path: 'receivedfiles', component: ReceivedFilesComponent },
  { path: 'sharedfiles', component: SharedFilesComponent },
  { path: 'share', component: Share },
];
//Ngmodule to import and export the RouterModule
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
