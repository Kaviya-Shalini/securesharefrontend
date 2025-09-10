import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false; // 🔹 spinner flag

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onLogin() {
    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe((res: any) => {
        if (res?.token) {
          this.authService.setToken(res.token);
        }
      });
  }

  submit() {
    this.error = '';
    this.loading = true; // 🔹 start spinner
    localStorage.setItem('username', this.username);

    this.http
      .post('http://localhost:8080/api/auth/authenticate/signin', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false; // 🔹 stop spinner
          this.router.navigateByUrl('/verify-otp');
        },
        error: (err: any) => {
          this.loading = false; // 🔹 stop spinner
          this.error = err?.error?.message || 'Login failed';
        },
      });
  }
}
