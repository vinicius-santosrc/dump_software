import { Injectable } from '@angular/core';

export interface RecentSearch {
    id: string;
    type: 'user' | 'post';
    label: string;
    image?: string;
    createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class RecentSearchService {

    private STORAGE_KEY = 'recent_searches';
    private LIMIT = 10;

    // 🔥 GET
    getAll(): RecentSearch[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // 🔥 ADD (sem duplicar + move pro topo)
    add(item: Omit<RecentSearch, 'createdAt'>) {
        let list = this.getAll();

        // remove duplicado
        list = list.filter(i => i.id !== item.id);

        // adiciona no topo
        list.unshift({
            ...item,
            createdAt: Date.now()
        });

        // limita
        list = list.slice(0, this.LIMIT);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }

    // 🔥 REMOVE
    remove(id: string) {
        const list = this.getAll().filter(i => i.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }

    // 🔥 CLEAR ALL
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}