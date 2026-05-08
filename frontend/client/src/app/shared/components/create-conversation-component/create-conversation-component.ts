import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { BasicInputComponent } from "../basic-input-component/basic-input.component";
import { User } from "../../../core/models/user/user.model";
import { GenericCardUserComponent } from "../generic-card-user/generic-card-user.component";
import { UserService } from "../../../core/services/user/user.service";
import { CreateConversationService } from "./create-conversation.service";
import { GenericButtonComponent } from "../generic-button-component/generic-button.component";
import { SearchResponse } from "../../../core/models/search/search.model";
import { SearchService } from "../../../core/services/search/search.service";
import { LoaderComponent } from "../loader-component/loader.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: "app-create-conversation-component",
    templateUrl: "./create-conversation-component.html",
    styleUrl: "./create-conversation-component.scss",
    imports: [MatIcon, BasicInputComponent, GenericCardUserComponent, GenericButtonComponent, LoaderComponent, TranslateModule],
})
export class CreateConversationComponent implements OnInit {
    @Inject(MAT_DIALOG_DATA) public data?: []
    input: any;
    userList: User[] | undefined;
    selectedUserIds: string[] = [];
    current_user: any;
    results: SearchResponse = {} as SearchResponse;
    loading: boolean = false;
    constructor(
        private readonly userService: UserService,
        private readonly dialog: MatDialog,
        private readonly createConversationService: CreateConversationService,
        private readonly searchService: SearchService
    ) {
        this.userService.user$.subscribe((user: any) => {
            this.current_user = user;
        });
    }

    onSearchChange(query: string) {
        this.loading = true;

        this.searchService.search(query).subscribe((res: any) => {
            this.userList = res.data.search.users;
            this.loading = false;
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

                // 🔥 1. Atualiza lista local imediatamente (optimistic update)
                if (this.userList) {
                    this.userList = this.userList.filter(u =>
                        !this.selectedUserIds.includes(u.id)
                    );
                }

                // 🔥 2. Dispara evento global (para sidebar/messages atualizar)
                window.dispatchEvent(new CustomEvent('conversationCreated', {
                    detail: conversation
                }));

                // 🔥 3. Fecha modal
                this.dialog.closeAll();
            }
        });
    }

}