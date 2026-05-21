import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDialog, MatDialogClose } from "@angular/material/dialog";
import { BasicInputComponent } from "../../../shared/components/basic-input-component/basic-input.component";
import { GenericButtonComponent } from "../../../shared/components/generic-button-component/generic-button.component";
import {AvatarItem} from "../../../shared/components/avatar-item/avatar-item.component";
import { User } from "../../../core/models/user/user.model";
import { UserService } from "../../../core/services/user/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MediaProcessingService } from "../../../core/services/media/media-processing.service";
import { SelectInputComponent } from "../../../shared/components/select-input-component/select-input.component";
import { GenericModalComponent } from "../../../shared/components/generic-modal/generic-modal.component";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
    selector: "app-profile-edit-component",
    templateUrl: "./profile-edit.component.html",
    styleUrl: "./profile-edit.component.scss",
    imports: [CommonModule, MatIcon, MatButton, MatDialogClose, MatIconButton, BasicInputComponent, GenericButtonComponent, AvatarItem, SelectInputComponent, GenericModalComponent, TranslateModule]
})
export class ProfileEditComponent implements OnInit {
    private readonly _snackBar = inject(MatSnackBar);
    current_user: User | any;
    actionButtons = [
        {
            label: 'USER_PROFILE.EDIT_PROFILE.BUTTON.UPDATE',
            click: () => this.updateUser()
        }
    ];
    constructor(
    private readonly userService: UserService,
        private readonly dialog: MatDialog,
        private readonly mediaService: MediaProcessingService
    ) { }
    ngOnInit(): void {
        this.current_user = this.userService.getUser();
    }

    close() {
        this.dialog.closeAll();
    }

    updateUser() {
        this.userService.updateUser(this.current_user).subscribe(() => {
            this._snackBar.open('Perfil atualizado!', undefined, {
                duration: 2000,
            })
            globalThis.location.reload();
        })
    }

    removeImage() {
        this.current_user.profilePictureUrl = null;
    }

    async onFileSelected(file: File) {
        const compressed = await this.mediaService.compressImage(file, 460);
        const thumbnail = await this.mediaService.compressImage(file, 96);
        const base64 = await this.mediaService.toBase64(compressed);
        const thumbnailBase64 = await this.mediaService.toBase64(thumbnail);

        this.current_user = {
            ...this.current_user,
            profilePictureUrl: base64,
            thumbnail: thumbnailBase64
        };
    }
}