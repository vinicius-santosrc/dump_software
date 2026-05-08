import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VideoDumpService {

    private readonly currentPlaying = new BehaviorSubject<HTMLVideoElement | null>(null);
    currentPlaying$ = this.currentPlaying.asObservable();

    private readonly muted = new BehaviorSubject<boolean>(true);
    muted$ = this.muted.asObservable();

    setCurrent(video: HTMLVideoElement) {
        const current = this.currentPlaying.value;

        if (current && current !== video) {
            current.pause();
        }

        this.currentPlaying.next(video);
    }

    toggleMute() {
        this.muted.next(!this.muted.value);
    }

    setMute(value: boolean) {
        this.muted.next(value);
    }

    getMute() {
        return this.muted.value;
    }
}