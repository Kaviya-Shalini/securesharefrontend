import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

interface FileData {
  id: number;
  filename: string;
  description: string;
  category: string;
  createdAt: Date;
}

interface FilesResponse {
  fetchFiles: FileData[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}
@Component({
  selector: 'app-mywallet',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './mywallet.html',
  styleUrl: './mywallet.css',
})
export class MyWalletComponent implements OnInit, AfterViewInit {
  files: FileData[] = [];
  selectedCard: FileData | null = null;
  isSidebarClosed = false;
  searchQuery: string = '';

  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;

  // 0-based index for API
  currentPage = 0;
  totalPages = 0;
  pageSize = 6;
  totalElements = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadPage();
  }

  ngAfterViewInit() {
    this.adjustCardHeights();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.adjustCardHeights();
  }

  checkScreenSize() {
    this.isSidebarClosed = window.innerWidth <= 992;
  }

  onSidebarToggle(state: boolean) {
    this.isSidebarClosed = state;
  }

  toggleSidebar() {
    if (this.sidebar) this.sidebar.toggleSidebar();
  }

  /** Load files with pagination */
  loadPage() {
    this.http
      .get<FilesResponse>(
        `http://localhost:8080/api/auth/files/fetch-all?pageNumber=${
          this.currentPage + 1
        }&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.files = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Failed to load files', err),
      });
  }

  /** Search with pagination */
  searchFilesWithPagination() {
    if (!this.searchQuery.trim()) {
      this.currentPage = 0;
      this.loadPage();
      return;
    }
    this.http
      .get<FilesResponse>(
        `http://localhost:8080/api/auth/files/fetch-all?keyword=${encodeURIComponent(
          this.searchQuery
        )}&pageNumber=${this.currentPage + 1}&pageSize=${this.pageSize}`,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          this.files = res.fetchFiles;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          setTimeout(() => this.adjustCardHeights(), 0);
        },
        error: (err) => console.error('Search failed', err),
      });
  }

  /** Build page range with "..." */
  paginationRange(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage + 1; // convert to 1-based for display
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (Number(i) - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (Number(i) - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = Number(i);
    }
    return rangeWithDots;
  }

  /** Template-safe helpers to avoid arithmetic on string '...' */
  isActivePage(page: number | string): boolean {
    return typeof page === 'number' ? page - 1 === this.currentPage : false;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page - 1); // convert to 0-based
    }
  }

  /** Pagination controls */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchQuery.trim() ? this.searchFilesWithPagination() : this.loadPage();
    }
  }

  /** File actions */
  downloadFile(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.http
      .get(`http://localhost:8080/api/auth/files/download/${file.id}`, {
        responseType: 'blob',
        withCredentials: true,
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Download failed', err),
      });
  }

  shareFile(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/sensitivity', file.id]);
  }

  deleteFile(file: FileData, event: MouseEvent) {
    event.stopPropagation();
    this.http
      .delete(`http://localhost:8080/api/auth/files/delete/${file.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.files = this.files.filter((f) => f.id !== file.id);
        },
        error: (err) => console.error('Delete failed', err),
      });
  }

  selectCard(file: FileData) {
    this.selectedCard = this.selectedCard?.id === file.id ? null : file;
  }

  private adjustCardHeights() {
    if (!this.cardElements || this.cardElements.length === 0) return;
    this.cardElements.forEach((card) => (card.nativeElement.style.height = 'auto'));
    let maxHeight = 0;
    this.cardElements.forEach((card) => {
      const height = card.nativeElement.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    this.cardElements.forEach((card) => (card.nativeElement.style.height = maxHeight + 'px'));
  }
}
