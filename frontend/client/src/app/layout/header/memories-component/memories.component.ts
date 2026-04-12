import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { MemoriesService } from "../../../core/services/memories/memories.service";
import { SkeletonComponent } from "../../../shared/components/skeleton/skeleton.component";

@Component({
    selector: "app-memories-component",
    templateUrl: "./memories.component.html",
    styleUrl: "./memories.component.scss",
    imports: [CommonModule, TranslateModule, SkeletonComponent]
})
export class MemoriesComponent implements OnInit {
    @Input() user: User | null = null;
    @Input() width: string = "";
    hasMyMemorie: boolean = false;
    
    constructor(
        private readonly memoriesService: MemoriesService
    ) { }
    memoriesList: any[] = [];
    loading: boolean = true;

    get isMobile(): boolean {
        return window.innerWidth <= 768;
    }
    
    ngOnInit(): void {
        this.getAllMoments();
        if (this.isMobile) {
            this.width = '100%';
        }
    }

    public async getAllMoments() {
        this.loading = true;

        const response = await this.memoriesService
            .getByUser(this.user?.id ?? "");

        this.memoriesList = Array.isArray(response) ? response : [];

        this.hasMyMemorie = Array.isArray(this.memoriesList) && this.memoriesList.some(
            (m: any) => m?.user?.id === this.user?.id
        );

        this.loading = false;
    }

    handleMyStory() {
        if (this.hasMyMemorie) {
            console.log("abrir meus stories");
            // abrir viewer
        } else {
            console.log("criar story");
            // abrir create
        }
    }
}