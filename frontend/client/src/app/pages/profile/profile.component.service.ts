import { Injectable } from '@angular/core';
import { UserService } from '../../core/services/user/user.service';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { PostsService } from '../../core/services/post/post.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileComponentService {

  private readonly backgroundColorSubject = new BehaviorSubject<string>('#ffffff');
  backgroundColor$ = this.backgroundColorSubject.asObservable();
  private readonly profileCache = new Map<string, Observable<any>>();
  private readonly postsCache = new Map<string, Observable<any>>();
  
    constructor(
        private readonly userService: UserService,
        private readonly postsService: PostsService
  ) {}

  getUserByUsername(username: string) {

    if (this.profileCache.has(username)) {
      return this.profileCache.get(username)!;
    }

    const request = this.userService.getUserByUsername(username);

    this.profileCache.set(username, request);

    return request;
  }

  setBackgroundFromImage(imageUrl: string, username?: string) {
    if (!imageUrl) return;
    if (imageUrl === "white" || imageUrl.startsWith("#") || imageUrl.startsWith("rgb")) {
      const color = imageUrl === "white" ? "#ffffff" : imageUrl;

        this.backgroundColorSubject.next(color);

        const elements = globalThis.document.getElementsByClassName('dump_content');

        if (elements && elements.length > 0) {
            const el = elements[0] as HTMLElement;
            el.style.background = color;
        }

        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl + '?cacheBust=' + Date.now();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No ctx');

        const size = 50;
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const lighten = (v: number) => Math.min(255, v + 80);

        this.backgroundColorSubject.next(
          `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`
        );

        const elements = globalThis.document.getElementsByClassName('dump_content');

        if (elements && elements.length > 0) {
          const el = elements[0] as HTMLElement;
          el.style.background = `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
        }

      } catch {
        this.generateColorFromUsername(username || 'user');
      }
    };

    img.onerror = () => {
      this.generateColorFromUsername(username || 'user');
    };
  }

  private generateColorFromUsername(username: string) {
    let hash = 0;

    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    let r = (hash >> 0) & 255;
    let g = (hash >> 8) & 255;
    let b = (hash >> 16) & 255;

    r = Math.min(255, r + 100);
    g = Math.min(255, g + 100);
    b = Math.min(255, b + 100);

    this.backgroundColorSubject.next(`rgb(${r}, ${g}, ${b})`);
  }
    
    public getPostsByUser(userId: string): any {

        if (this.postsCache.has(userId)) {
            return this.postsCache.get(userId)!;
        }

        const request = this.postsService.getByUser(userId).pipe(
            shareReplay(1)
        );

        this.postsCache.set(userId, request);

        return request;
    }
}