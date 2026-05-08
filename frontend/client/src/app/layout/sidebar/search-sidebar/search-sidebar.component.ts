import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-search-sidebar',
    imports: [CommonModule, FormsModule, BasicInputComponent, MatIcon, LoaderComponent, GenericCardUserComponent, PostMediaComponent, MatButtonModule, TranslateModule],
    templateUrl: './search-sidebar.component.html',
    styleUrl: './search-sidebar.component.scss'
})
export class SearchSidebarComponent implements AfterViewInit, OnInit {

    @Output() close = new EventEmitter<void>();

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    query: string = '';

    results: SearchResponse = {} as SearchResponse;
    loading = false;

    constructor(private readonly searchService: SearchService, private readonly recentSearchService: RecentSearchService, private readonly router: Router) { }

    onSearchChange(query: string) {
        this.loading = true;

        this.searchService.search(query).subscribe((res: any) => {
            this.results = res.data.search;
            this.loading = false;
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

    recentSearches: any = [];

    ngOnInit() {
        this.load();
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
}