import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, filter, takeUntil } from 'rxjs';

import { locale as ptLang } from './config/i18n/pt';
import { locale as enLang } from './config/i18n/en';
import { locale as esLang } from './config/i18n/es';

import {
  WHITE_LIST_NAVIGATIONS,
  WHITE_LIST_ROUTES
} from './core/config/api.config';

import { TranslationService } from './core/services/translate.service';
import { UserService } from './core/services/user/user.service';
import { ChatRealtimeService } from './core/services/messages/chat-realtime.service';
import { MessagesStoreService } from './store/conversation.store.service';
import { ThemeService } from './core/services/theme.service';

import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import { NotificationComponent } from './pages/notifications/notification.component';
import { FooterAuthComponent } from './shared/components/footer-auth-component/footer-auth-component';
import { IncomingCallModalComponent } from './pages/call/call-incoming/incoming-call-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslateModule,
    SidebarComponent,
    HeaderComponent,
    NotificationComponent,
    FooterAuthComponent,
    IncomingCallModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent
  implements OnInit, AfterViewInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly userService = inject(UserService);
  private readonly realtime = inject(ChatRealtimeService);
  private readonly store = inject(MessagesStoreService);
  private readonly themeService = inject(ThemeService);

  readonly WHITE_LIST_ROUTES = WHITE_LIST_ROUTES;

  routeLoading: boolean = false;

  contentWidth: string = '850px';

  currentTheme: 'light' | 'dark' = 'dark';

  splashScreenImage: string =
    'assets/app/media/anim/icon/splash-screen.svg';

  @ViewChild('splashScreen', { read: ElementRef })
  splashScreen!: ElementRef;

  constructor() {
    this.initializeTranslations();
    this.initializeTheme();
  }

  get currentPath(): string {
    return globalThis.location.pathname;
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  get shouldHideLayout(): boolean {
    return this.WHITE_LIST_ROUTES
      .includes(this.currentPath);
  }

  ngOnInit(): void {
    this.initializeAuth();
    this.initializeRouterEvents();
    this.initializeSidebarListeners();
    this.store.setActiveConversation('');
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      this.hideSplashScreen();
    }, 500);
  }

  ngOnDestroy(): void {

    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTranslations(): void {
    this.translationService.loadTranslations(
      ptLang,
      enLang,
      esLang
    );
  }

  private initializeTheme(): void {
    this.themeService.loadTheme();
    this.currentTheme = this.themeService.getTheme();

    this.splashScreenImage =
      this.currentTheme === 'light'
        ? 'assets/app/media/anim/icon/splash-screen.svg'
        : 'assets/app/media/anim/icon/splash-screen-light.svg';
  }

  private initializeAuth(): void {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    this.userService
      .loadUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {

        if (!user) {
          return;
        }

        this.realtime.init();

        this.store.refreshTrigger();
      });
  }

  private initializeRouterEvents(): void {

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {

        if (event instanceof NavigationStart) {
          this.routeLoading = true;
        }

        if (event instanceof NavigationEnd) {

          this.handleLayoutWidth(event.url);

          if (event.url.includes('/messages')) {
            this.store.refreshTrigger();
          }
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          setTimeout(() => {
            this.routeLoading = false;
          }, 500);
        }
      });
  }

  private initializeSidebarListeners(): void {

    this.updateContentWidth();

    globalThis.addEventListener(
      'sidebarToggle',
      this.handleSidebarToggle as EventListener
    );

    window.addEventListener(
      'resize',
      this.handleResize
    );
  }

  private readonly handleSidebarToggle = (
    event: any
  ): void => {

    this.updateContentWidth(event.detail);
  };

  private readonly handleResize = (): void => {

    const sidebarOpen =
      localStorage.getItem('sidebar') === 'true';

    this.updateContentWidth(sidebarOpen);
  };

  private handleLayoutWidth(url: string): void {

    const shouldHideSidebar =
      WHITE_LIST_NAVIGATIONS
        .some(route => url.startsWith(route));

    if (shouldHideSidebar || this.isMobile) {
      this.contentWidth = '100%';
    }
    else {
      this.contentWidth = '750px';
    }

    if (url.startsWith('/messages/inbox')) {
      this.contentWidth = '65%';
    }
  }

  private updateContentWidth(
    sidebarOpen?: boolean
  ): void {

    if (this.isMobile) {
      this.contentWidth = '100%';
      return;
    }

    this.contentWidth = sidebarOpen
      ? '750px'
      : '750px';
  }

  private hideSplashScreen(): void {

    if (!this.splashScreen?.nativeElement) {
      return;
    }

    const element =
      this.splashScreen.nativeElement as HTMLElement;

    element.classList.add('fade-out');

    setTimeout(() => {
      element.remove();
    }, 500);
  }
}
