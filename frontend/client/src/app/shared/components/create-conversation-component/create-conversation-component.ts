import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { BasicInputComponent } from "../basic-input-component/basic-input.component";
import { User } from "../../../core/models/user/user.model";
import { GenericCardUserComponent } from "../generic-card-user/generic-card-user.component";
import { UserService } from "../../../core/services/user/user.service";
import { CreateConversationService } from "./create-conversation.service";

@Component({
    selector: "app-create-conversation-component",
    templateUrl: "./create-conversation-component.html",
    styleUrl: "./create-conversation-component.scss",
    imports: [MatIcon, BasicInputComponent, GenericCardUserComponent],
})
export class CreateConversationComponent implements OnInit {
    @Inject(MAT_DIALOG_DATA) public data?: []
    input: any;
    userList: User[] | undefined;
    selectedUserIds: string[] = [];
    current_user: any;

    constructor(
        private readonly userService: UserService,
        private readonly dialog: MatDialog,
        private readonly createConversationService: CreateConversationService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
    }

    ngOnInit(): void {
        this.getRelatedUsers()
    }

    getRelatedUsers() {
        this.userService.getRelatedByCurrentUser().subscribe((users: User[] | any) => {
            this.userList = users;
        });
    }

    onToggleUser(userId: string) {
        if (this.selectedUserIds.includes(userId)) {
            this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
        } else {
            this.selectedUserIds.push(userId);
        }
    }

    close() {
        this.dialog.closeAll();
    }

    createConversation(): any {
        if (!this.selectedUserIds.includes(this.current_user.id)) {
            this.selectedUserIds.push(this.current_user.id);
        }
        this.createConversationService.createConversation(this.selectedUserIds).subscribe((conversation: any) => {
            if (conversation) {
                this.dialog.closeAll();
            }
        })
    }

}