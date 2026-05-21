import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    setTheme(theme: 'light' | 'dark') {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        if (theme == 'dark') document.body.style.background = "#121212";
        else document.body.style.background = "#FAFAFAFA"

        localStorage.setItem('theme', theme);
    }

    getTheme(): 'light' | 'dark' {
        const saved = localStorage.getItem('theme') || 'light';
        return saved as 'light' | 'dark';
     }

    loadTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        this.setTheme(saved as any);
    }
}