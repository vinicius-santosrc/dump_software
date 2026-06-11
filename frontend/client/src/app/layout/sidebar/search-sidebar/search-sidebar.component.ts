import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { MatIcon } from "@angular/material/icon";
import { SearchService } from '../../../core/services/search/search.service';
import { SearchResponse } from '../../../core/models/search/search.model';
import { LoaderComponent } from "../../../shared/components/loader-component/loader.component";
import { GenericCardUserComponent } from "../../../shared/components/generic-card-user/generic-card-user.component";
import { PostMediaComponent } from "../../../shared/components/post-component/components/post-media-component/post-media.component";
import { RecentSearchService } from '../../../core/services/search/recent-search.service';
import { Router } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { TranslateModule } from '@ngx-translate/core';

import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-search-sidebar',
    imports: [CommonModule, FormsModule, BasicInputComponent, MatIcon, LoaderComponent, GenericCardUserComponent, PostMediaComponent, MatButtonModule, TranslateModule],
    templateUrl: './search-sidebar.component.html',
    styleUrl: './search-sidebar.component.scss'
})
export class SearchSidebarComponent implements AfterViewInit, OnInit, OnDestroy {

    @Output() close = new EventEmitter<void>();

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    query: string = '';

    results: SearchResponse = {} as SearchResponse;
    loading = false;

    recentSearches: any[] = [];

    private readonly searchInput$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    constructor(private readonly searchService: SearchService, private readonly recentSearchService: RecentSearchService, private readonly router: Router) { }

    onSearchInput(value: string): void {
        this.query = value?.trim() ?? '';
        this.searchInput$.next(this.query);
    }

    private onSearchChange(query: string): void {
        if (!query) {
            this.results = {} as SearchResponse;
            this.loading = false;
            return;
        }

        this.loading = true;

        this.searchService.search(query).subscribe({
            next: (res: SearchResponse) => {
                this.results = {
                    users: res.users ?? [],
                    posts: res.posts ?? []
                };
                this.loading = false;
            },
            error: () => {
                this.results = {} as SearchResponse;
                this.loading = false;
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.input?.nativeElement.focus();
        }, 0);
    }

    handleClose() {
        this.close.emit();
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('overlay')) {
            this.handleClose();
        }
    }
    
    ngOnInit(): void {
        this.load();

        this.searchInput$
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe((query) => this.onSearchChange(query));
    }

    load() {
        this.recentSearches = this.recentSearchService.getAll();
    }

    remove(id: string) {
        this.recentSearchService.remove(id);
        this.load();
    }

    clear() {
        this.recentSearchService.clear();
        this.load();
    }

    add_recent(item: any) {
        this.recentSearchService.add(item);
    }
    
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.searchInput$.complete();
    }
}