import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { locale as ptLang } from './config/i18n/pt';
import { locale as enLang } from './config/i18n/en';
import { locale as esLang } from './config/i18n/es';
import { TranslationService } from './core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from './core/services/user/user.service';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { HeaderComponent } from "./layout/header/header.component";
import { WHITE_LIST_ROUTES } from './core/config/api.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Dump';
  width: string = 'calc(100% - 280px)';
  WHITE_LIST_ROUTES = WHITE_LIST_ROUTES;
  window = globalThis;

  @ViewChild('splashScreen', { read: ElementRef })
  splashScreen!: ElementRef;
  splashScreenImage: string = 'assets/app/media/anim/icon/splash-screen.svg';

  constructor(
    private readonly translationService: TranslationService,
    private readonly userService: UserService) {
    // register translations
    this.translationService.loadTranslations(ptLang, enLang, esLang);
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.userService.loadUser().subscribe();
    }
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.listenSidebar(); 
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

  listenSidebar() {
    const updateWidth = (isOpen: boolean) => {
      if (this.isMobile) {
        this.width = '100%';
        return;
      }

      this.width = isOpen
        ? 'calc(100% - 540px)'
        : 'calc(100% - 388px)';
    };

    // estado inicial
    const initial = localStorage.getItem('sidebar') === 'true';
    updateWidth(initial);

    globalThis.addEventListener('sidebarToggle', (event: any) => {
      updateWidth(event.detail);
    });

    // responsividade em tempo real
    window.addEventListener('resize', () => {
      updateWidth(localStorage.getItem('sidebar') === 'true');
    });
  }
}
