import { Component, OnInit, HostListener, ViewChildren, QueryList, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import { PaginationService,PaginatedResponse } from '../services/pagination';
import { Router } from '@angular/router';
interface SharedFile {
  id: number;
  senderName: string;
  receiverName: string;
  filename: string;
  category: string;
  isSensitive: boolean;
}

@Component({
  selector: 'app-sharedfiles',
   standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './sharedfiles.html',
  styleUrl: './sharedfiles.css'
})
export class SharedFilesComponent implements OnInit, AfterViewInit {
  allFiles: SharedFile[] = [];
  filteredFiles: SharedFile[] = [];
  searchQuery: string = '';
  filterType: 'all' | 'sensitive' | 'insensitive' = 'all';
  isSidebarClosed = false;

  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;

  
  constructor(private http: HttpClient, private router: Router,private paginationService:PaginationService) {}

  ngOnInit() {
    this.checkScreenSize();
    this.fetchSharedFiles();
  }

  ngAfterViewInit() {
    this.adjustCardHeights();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.adjustCardHeights();
    this.loadPage();
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

  fetchSharedFiles() {
  this.http.get<PaginatedResponse<SharedFile>>(
    'http://localhost:8080/api/shared-files/by-me',
    { params: { pageNumber: this.currentPage.toString(), pageSize: this.pageSize.toString() } }
  ).subscribe({
    next: (res) => {
      this.allFiles = res.fetchFiles;
      this.totalPages = res.totalPages;
      this.totalElements = res.totalElements;
      this.applyFilters();
      setTimeout(() => this.adjustCardHeights(), 0);
    },
    error: (err) => console.error('Failed to fetch shared files', err)
  });
}

  searchFiles() {
    if (!this.searchQuery.trim()) {
      this.fetchSharedFiles();
      return;
    }

    this.http.get<SharedFile[]>(`http://localhost:8080/api/shared-files/search?query=${this.searchQuery}`).subscribe({
      next: (res) => {
        this.allFiles = res;
        this.applyFilters();
        setTimeout(() => this.adjustCardHeights(), 0);
      },
      error: (err) => console.error('Search failed', err)
    });
  }

  setFilter(type: 'all' | 'sensitive' | 'insensitive') {
    this.filterType = type;
    this.applyFilters();
  }

  private applyFilters() {
    let files = [...this.allFiles];

    if (this.filterType === 'sensitive') {
      files = files.filter(f => f.isSensitive);
    } else if (this.filterType === 'insensitive') {
      files = files.filter(f => !f.isSensitive);
    }

    this.filteredFiles = files;
  }

  private adjustCardHeights() {
    if (!this.cardElements || this.cardElements.length === 0) return;
    this.cardElements.forEach(card => card.nativeElement.style.height = 'auto');
    let maxHeight = 0;
    this.cardElements.forEach(card => {
      const height = card.nativeElement.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    this.cardElements.forEach(card => {
      card.nativeElement.style.height = maxHeight + 'px';
    });
  }
    currentPage = 0;
    totalPages = 0;
    pageSize = 6;   // ✅ match backend
    totalElements = 0;
  
 loadPage() {
  this.http.get<PaginatedResponse<SharedFile>>(
    'http://localhost:8080/api/shared-files/by-me',
    { params: { pageNumber: this.currentPage.toString(), pageSize: this.pageSize.toString() } }
  ).subscribe((res: PaginatedResponse<SharedFile>) => {
    this.allFiles = res.fetchFiles;
    this.totalPages = res.totalPages;
    this.totalElements = res.totalElements;
    this.applyFilters();
    setTimeout(() => this.adjustCardHeights(), 0);
  });
}
  
    nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.searchQuery.trim()
        ? this.searchFilesWithPagination()
        : this.loadPage();
    }
  }
  
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.searchQuery.trim()
        ? this.searchFilesWithPagination()
        : this.loadPage();
    }
  }
   goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
  
      if (this.searchQuery.trim()) {
        this.searchFilesWithPagination();
      } else {
        this.loadPage();
      }
    }
  }
  
  
    //✅ Search with Pagination
    searchFilesWithPagination() {
  if (!this.searchQuery.trim()) {
    this.currentPage = 0;
    this.loadPage();
    return;
  }

  this.http.get<PaginatedResponse<SharedFile>>(`http://localhost:8080/api/shared-files/by-me`, {
    params: { 
      keyword: this.searchQuery,
      pageNumber: this.currentPage.toString(),
      pageSize: this.pageSize.toString()
    }
  }).subscribe({
    next: (res) => {
      this.allFiles = res.fetchFiles;
      this.totalPages = res.totalPages;
      this.applyFilters(); 
    },
    error: (err) => console.error('Search failed', err)
  });
}

}
