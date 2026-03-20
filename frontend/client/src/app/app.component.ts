import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { locale as ptLang } from './config/i18n/pt';
import { locale as enLang } from './config/i18n/en';
import { locale as esLang } from './config/i18n/es';
import { TranslationService } from './core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from './core/services/user/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'Dump';

  @ViewChild('splashScreen', { read: ElementRef })
  splashScreen!: ElementRef;
  splashScreenImage: string = 'assets/app/media/anim/icon/splash-screen.svg';

  constructor(
    private translationService: TranslationService,
    private userService: UserService) {
    // register translations
    this.translationService.loadTranslations(ptLang, enLang, esLang);
    const token = localStorage.getItem('accessToken');

    if (token) {
      this.userService.loadUser().subscribe();
    }
  }

  ngAfterViewInit(): void {
    // small delay so Angular finishes first render
    setTimeout(() => {
      if (this.splashScreen?.nativeElement) {
        const el = this.splashScreen.nativeElement as HTMLElement;
        el.classList.add('fade-out');

        setTimeout(() => {
          el.remove();
        }, 500);
      }
    }, 500);
  }
}
