import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-share',
    standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './share.html',
  styleUrl: './share.css'
})
export class Share implements OnInit {
  isSidebarClosed = false;
  fileId: string | null = null;
  username = '';
  sensitivity = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.applyAutoClose();
    this.fileId = this.route.snapshot.paramMap.get('id'); // <-- fetch fileId from route
  }

  @HostListener('window:resize')
  onResize() { this.applyAutoClose(); }

  applyAutoClose() {
    const shouldClose = window.innerWidth <= 992;
    if (this.isSidebarClosed !== shouldClose) this.isSidebarClosed = shouldClose;
  }

  onSidebarToggle(isClosed: boolean) {
    this.isSidebarClosed = isClosed;
  }

  shareFile() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.fileId) {
      this.errorMessage = 'File ID is missing!';
      return;
    }
    if (!this.username) {
      this.errorMessage = 'Please enter a username';
      return;
    }
    if (!this.sensitivity) {
      this.errorMessage = 'Please select sensitivity';
      return;
    }

    this.http.post<{ success: boolean; message?: string }>(
      'http://localhost:8080/api/share',
      { fileId: this.fileId, recipientUsername: this.username, isSensitive: this.sensitivity }
    ).subscribe({
      next: (res) => {
        if (res?.success) {
          this.successMessage = res.message || 'File shared successfully ✅';
          this.username = '';
          this.sensitivity = '';
        } else {
          this.errorMessage = res?.message || 'Failed to share file';
        }
      },
      error: () => {
        this.errorMessage = 'Error while sharing file. Please try again.';
      }
    });
  }
}

