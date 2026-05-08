import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { GenericCardUserComponent } from "../../../../shared/components/generic-card-user/generic-card-user.component";
import { GenericModalComponent } from "../../../../shared/components/generic-modal/generic-modal.component";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UserService } from "../../../../core/services/user/user.service";
import { BasicInputComponent } from "../../../../shared/components/basic-input-component/basic-input.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
    templateUrl: './following.component.html',
    imports: [CommonModule, GenericCardUserComponent, GenericModalComponent, BasicInputComponent, TranslateModule]
})
export class FollowingModalComponent implements OnInit {
    data: any;
    users: any = [];
    query: any;
    allUsers: any[] = [];

    constructor(
        private readonly userService: UserService,
        @Inject(MAT_DIALOG_DATA) data: any
    ) {
        this.data = data;
    }

    ngOnInit(): void {
        this.data?.users.map((user: string) => {
            this.userService.getUserById(user).subscribe((userDoc) => {
                this.users.push(userDoc);
                this.allUsers.push(userDoc);
            });
        })
    }

    onSearchChange(query: string) {
        this.query = query;

        if (!query) {
            this.users = [...this.allUsers];
            return;
        }

        const lower = query.toLowerCase();

        this.users = this.allUsers.filter((user: any) =>
            user.username?.toLowerCase().includes(lower) ||
            user.fullName?.toLowerCase().includes(lower)
        );
    }
}