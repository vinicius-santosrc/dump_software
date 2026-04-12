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
import { WHITE_LIST_ROUTES } from './core/config/api.config';
import { ChatService } from './core/services/messages/chat.service';
import { NotificationComponent } from "./pages/notifications/notification.component";
import { ChatRealtimeService } from './core/services/messages/chat-realtime.service';
import { MessagesStoreService } from './pages/messages/conversation.store.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, SidebarComponent, HeaderComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Dump';
  width: string = 'calc(100% - 280px)';
  WHITE_LIST_ROUTES = WHITE_LIST_ROUTES;
  window = globalThis;
  routeLoading: boolean = false;

  @ViewChild('splashScreen', { read: ElementRef })
  splashScreen!: ElementRef;
  splashScreenImage: string = 'assets/app/media/anim/icon/splash-screen.svg';

  constructor(
    private readonly translationService: TranslationService,
    private readonly userService: UserService,
    private readonly realtime: ChatRealtimeService,
    private readonly store: MessagesStoreService,
    private readonly router: Router) {
    // register translations
    this.translationService.loadTranslations(ptLang, enLang, esLang);
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
      });
    }

    this.listenSidebar();
    this.store.setActiveConversation("");

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.routeLoading = true;
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

      this.width = isOpen
        ? 'calc(100% - 588px)'
        : 'calc(100% - 588px)';
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
