import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RecentSearch {
    id: string;
    type: "user" | "post";
    label: string;
    image?: string;
    createdAt: number;
}

class RecentSearchService {
    private readonly STORAGE_KEY = "recent_searches";
    private readonly LIMIT = 10;

    async getAll(): Promise<RecentSearch[]> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("[RECENT_SEARCH] Erro ao buscar pesquisas recentes", error);
            return [];
        }
    }

    async add(item: Omit<RecentSearch, "createdAt">): Promise<void> {
        try {
            let list = await this.getAll();

            list = list.filter(i => i.id !== item.id);

            list.unshift({
                ...item,
                createdAt: Date.now()
            });

            list = list.slice(0, this.LIMIT);

            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        } catch (error) {
            console.error("[RECENT_SEARCH] Erro ao salvar pesquisa recente", error);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const list = (await this.getAll()).filter(i => i.id !== id);
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        } catch (error) {
            console.error("[RECENT_SEARCH] Erro ao remover pesquisa recente", error);
        }
    }

    async clear(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error("[RECENT_SEARCH] Erro ao limpar pesquisas recentes", error);
        }
    }
}

export const recentSearchService = new RecentSearchService();
export default recentSearchService;
