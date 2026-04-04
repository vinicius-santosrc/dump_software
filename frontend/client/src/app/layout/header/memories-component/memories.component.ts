import { Component, Input, OnInit } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { User } from "../../../core/models/user/user.model";
import { MemoriesService } from "../../../core/services/memories/memories.service";

@Component({
    selector: "app-memories-component",
    templateUrl: "./memories.component.html",
    styleUrl: "./memories.component.scss",
    imports: [TranslateModule]
})
export class MemoriesComponent implements OnInit {
    @Input() user: User | null = null;
    @Input() width: string = "";
    hasMyMemorie: boolean = false;
    
    constructor(
        private readonly memoriesService: MemoriesService
    ) { }
    memoriesList: any = [];

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
        const response = await this.memoriesService
            .getByUser(this.user?.id ?? "");

        this.memoriesList = response ?? [];

        // verifica se o usuário tem story
        this.hasMyMemorie = this.memoriesList.some(
            (m: any) => m.user.id === this.user?.id
        );
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