import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { ExplorePostCard, ExploreSection } from "../../../core/models/feed/explore.model";

@Component({
    selector: "app-explore-section-modal",
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogClose],
    templateUrl: "./explore-section-modal.component.html",
    styleUrl: "./explore-section-modal.component.scss"
})
export class ExploreSectionModalComponent {
    section: ExploreSection;

    constructor(
        @Inject(MAT_DIALOG_DATA) private readonly data: { section: ExploreSection },
        private readonly dialogRef: MatDialogRef<ExploreSectionModalComponent>
    ) {
        this.section = data.section;
    }

    openQuickReels(post: ExplorePostCard): void {
        const payload: any = {
            section: this.section,
            post
        };

        this.dialogRef.close(payload);
    }
}