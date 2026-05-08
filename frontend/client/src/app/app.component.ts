import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { locale as ptLang } from './config/i18n/pt';
import { locale as enLang } from './config/i18n/en';
import { locale as esLang } from './config/i18n/es';
import { TranslationService } from './core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from './core/services/user/user.service';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { HeaderComponent } from "./layout/header/header.component";
import { WHITE_LIST_NAVIGATIONS, WHITE_LIST_ROUTES } from './core/config/api.config';
import { NotificationComponent } from "./pages/notifications/notification.component";
import { ChatRealtimeService } from './core/services/messages/chat-realtime.service';
import { MessagesStoreService } from './store/conversation.store.service';
import { FooterAuthComponent } from "./shared/components/footer-auth-component/footer-auth-component";
import { ProfileComponentService } from './pages/profile/profile.component.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, SidebarComponent, HeaderComponent, NotificationComponent, FooterAuthComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Dump';
  width: string = '850px';
  WHITE_LIST_ROUTES = WHITE_LIST_ROUTES;
  window = globalThis;
  routeLoading: boolean = false;
  theme: any;

  @ViewChild('splashScreen', { read: ElementRef })
  splashScreen!: ElementRef;
  splashScreenImage: string = 'assets/app/media/anim/icon/splash-screen.svg';

  constructor(
    private readonly translationService: TranslationService,
    private readonly userService: UserService,
    private readonly realtime: ChatRealtimeService,
    private readonly store: MessagesStoreService,
    private readonly router: Router,
    private readonly profileService: ProfileComponentService,
    private readonly themeService: ThemeService) {
    // register translations
    this.translationService.loadTranslations(ptLang, enLang, esLang);
    this.themeService.loadTheme();

    this.theme = this.themeService.getTheme();
    this.splashScreenImage = this.theme === 'light' ? 'assets/app/media/anim/icon/splash-screen.svg' : 'assets/app/media/anim/icon/splash-screen-light.svg';

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = this.router.url;
        let showSidebar = !WHITE_LIST_NAVIGATIONS.some(route => url.startsWith(route));
        if (!showSidebar) this.width = '100%'
        else {
          if (this.isMobile) {
            this.width = '100%'
          }
          else this.width = '850px';
        }

      }
    });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

    ngOnInit(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.userService.loadUser().subscribe(user => {
        if (!user) return;

        this.realtime.init();

        this.store.refreshTrigger();
      });
    }

    this.listenSidebar();
    this.store.setActiveConversation("");

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.routeLoading = true;
        // this.profileService.setBackgroundFromImage("white");
      }

      if (event instanceof NavigationEnd && event.url.includes('/messages')) {
        this.store.refreshTrigger();
      }
      
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.routeLoading = false;
        }, 500); // tempo do loader
      }
    });
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
    }

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
