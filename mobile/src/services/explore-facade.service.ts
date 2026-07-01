

import {
    ExploreCommunitySignal,
    ExploreInsight,
    ExploreLiveCard,
    ExplorePostCard,
    ExploreSection,
    ExploreState,
    ExploreSticker,
    ExploreTopic
} from "../models/feed/explore.model";
import { Topic } from "../models/feed/topic.model";
import { SearchPost } from "../models/search/search.model";
import { searchService } from "../search/search.service";
import { topicService } from "../topic/topic.service";

class ExploreFacadeService {
    readonly initialTopics: ExploreTopic[] = [{ id: "trending", label: "Em alta" }];

    readonly initialInsights: ExploreInsight[] = [
        {
            id: "radar",
            title: "Radar Dump",
            value: "Carregando",
            description: "Assuntos crescendo antes de virar tendência.",
            icon: "radar"
        },
        {
            id: "engagement",
            title: "Engajamento agora",
            value: "0 ações",
            description: "Soma de likes, saves, shares e menções nos tópicos.",
            icon: "bolt"
        },
        {
            id: "creator",
            title: "Criadores em ascensão",
            value: "Explorar",
            description: "Perfis e posts pequenos ganhando alcance rápido.",
            icon: "auto_awesome"
        }
    ];

    readonly trendingStickers: ExploreSticker[] = [
        { id: "s1", emoji: "🔥", label: "Pegando fogo", usage: "18,4 mil usos" },
        { id: "s2", emoji: "😭", label: "Chorando de rir", usage: "12,9 mil usos" },
        { id: "s3", emoji: "✨", label: "Momento cinema", usage: "9,7 mil usos" },
        { id: "s4", emoji: "👀", label: "Todo mundo vendo", usage: "7,1 mil usos" },
        { id: "s5", emoji: "💀", label: "Não tankei", usage: "6,8 mil usos" }
    ];

    readonly communitySignals: ExploreCommunitySignal[] = [
        {
            id: "cs1",
            user: "João Vitor",
            action: "curtiu um post em alta",
            postTitle: "Challenge que está subindo agora",
            avatarUrl: "https://i.pravatar.cc/96?img=21"
        },
        {
            id: "cs2",
            user: "Maria Clara",
            action: "salvou uma trend",
            postTitle: "Corte viral da comunidade",
            avatarUrl: "https://i.pravatar.cc/96?img=36"
        },
        {
            id: "cs3",
            user: "Lucas Dev",
            action: "comentou em um tópico",
            postTitle: "Discussão quente no Dump",
            avatarUrl: "https://i.pravatar.cc/96?img=57"
        }
    ];

    private readonly fallbackTopicLabels = [
        "Canto e Dança",
        "Comédia",
        "Esportes",
        "Relacionamento",
        "Anime e quadrinhos",
        "Shows",
        "Vida cotidiana",
        "Jogos"
    ];

    async getExploreState(): Promise<ExploreState> {
        let rawTopics: Topic[] = [];

        try {
            rawTopics = await topicService.getTrending(10);
        } catch (error) {
            console.error("[EXPLORE] Erro ao buscar tópicos em alta", error);
        }

        const normalizedTopics = this.normalizeTopics(rawTopics);
        const topicsToLoad = normalizedTopics.length > 0
            ? normalizedTopics.slice(0, 6)
            : this.fallbackTopicLabels.map(label => ({
                id: this.slugify(label),
                label,
                slug: this.slugify(label)
            }));

        const sections = await Promise.all(
            topicsToLoad.map(async topic => {
                try {
                    const response = await searchService.searchOnce(topic.label);
                    return this.createSectionFromSearch(topic, response.posts ?? []);
                } catch (error) {
                    console.error(`[EXPLORE] Erro ao buscar posts do tópico ${topic.label}`, error);
                    return this.createEmptySection(topic);
                }
            })
        );

        return {
            topics: [
                ...this.initialTopics,
                ...normalizedTopics
            ],
            liveCards: this.createLiveCardsFromSections(sections),
            insights: this.createInsights(rawTopics),
            sections,
            trendingStickers: this.trendingStickers,
            communitySignals: this.communitySignals
        };
    }

    filterSections(sections: ExploreSection[], selectedTopicId: string, searchTerm: string): ExploreSection[] {
        const term = searchTerm.trim().toLowerCase();
        const baseSections = selectedTopicId === "trending"
            ? sections
            : sections.filter(section => section.id === selectedTopicId);

        if (!term) return baseSections;

        return baseSections
            .map(section => ({
                ...section,
                posts: section.posts.filter(post =>
                    post.title.toLowerCase().includes(term)
                    || post.author.toLowerCase().includes(term)
                    || section.title.toLowerCase().includes(term)
                )
            }))
            .filter(section => section.posts.length > 0);
    }

    getVisiblePosts(section: ExploreSection): ExplorePostCard[] {
        return section.expanded ? section.posts : section.posts.slice(0, 6);
    }

    getPostIcon(type: ExplorePostCard["type"]): string {
        const icons: Record<ExplorePostCard["type"], string> = {
            post: "photo_camera",
            video: "play_arrow",
            thread: "forum",
            audio: "graphic_eq",
            live: "sensors"
        };

        return icons[type];
    }

    formatMetric(value: number): string {
        return this.compactNumber(value);
    }

    toggleLike(post: ExplorePostCard): ExplorePostCard {
        return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.likes + (post.isLiked ? -1 : 1)
        };
    }

    toggleSave(post: ExplorePostCard): ExplorePostCard {
        return {
            ...post,
            isSaved: !post.isSaved,
            saves: post.saves + (post.isSaved ? -1 : 1)
        };
    }

    sharePost(post: ExplorePostCard): ExplorePostCard {
        return {
            ...post,
            shares: post.shares + 1
        };
    }

    commentPost(post: ExplorePostCard): ExplorePostCard {
        return {
            ...post,
            comments: post.comments + 1
        };
    }

    private normalizeTopics(topics: Topic[]): ExploreTopic[] {
        return (topics ?? []).map(topic => ({
            id: topic.slug || topic.id || this.slugify(topic.title),
            slug: topic.slug,
            label: topic.title,
            hot: topic.growthRate > 0,
            postsRelated: topic.postsRelated,
            growthRate: topic.growthRate,
            trendingScore: topic.trendingScore
        }));
    }

    private createSectionFromSearch(topic: ExploreTopic, posts: SearchPost[]): ExploreSection {
        const mappedPosts = (posts ?? [])
            .slice(0, 10)
            .map((post, index) => this.mapSearchPostToExplorePost(post, topic, index));

        return {
            id: topic.id,
            title: topic.label,
            icon: this.getTopicIcon(topic.label),
            description: this.getTopicDescription(topic),
            posts: mappedPosts,
            expanded: false,
            empty: mappedPosts.length === 0
        };
    }

    private createEmptySection(topic: ExploreTopic): ExploreSection {
        return {
            id: topic.id,
            title: topic.label,
            icon: this.getTopicIcon(topic.label),
            description: this.getTopicDescription(topic),
            posts: [],
            expanded: false,
            empty: true
        };
    }

    private mapSearchPostToExplorePost(post: SearchPost, topic: ExploreTopic, index: number): ExplorePostCard {
        const media = Array.isArray(post.media) ? post.media[0] : post.media;
        const mediaType = media?.type ?? "";
        const title = post.caption?.trim() || `Post em ${topic.label}`;

        return {
            id: post.id,
            title,
            author: "@dump",
            meta: topic.postsRelated ? `${topic.postsRelated} posts relacionados` : "Relacionado ao tópico",
            height: this.getCardHeight(index, mediaType),
            type: this.getPostType(mediaType),
            score: `${Math.max(62, Math.round(topic.trendingScore ?? 78))}%`,
            imageUrl: post.imageUrl || media?.thumbnail || media?.url,
            media: post.media,
            likes: this.getMockMetric(index, 240, 8600),
            comments: this.getMockMetric(index, 12, 680),
            saves: this.getMockMetric(index, 20, 1300),
            shares: this.getMockMetric(index, 5, 420),
            isLiked: false,
            isSaved: false
        };
    }

    private createLiveCardsFromSections(sections: ExploreSection[]): ExploreLiveCard[] {
        return sections
            .flatMap(section => section.posts)
            .slice(0, 4)
            .map((post, index) => ({
                id: `live-${post.id}`,
                username: post.author || "@dump",
                title: post.type === "live" ? "Em uma transmissão ao vivo" : post.title,
                watching: `+${Math.max(2, index + 2)} assistindo`,
                avatarUrl: post.imageUrl || `https://i.pravatar.cc/96?img=${12 + index}`,
                accent: ["#ff3040", "#1881e2", "#8b5cf6", "#22c55e"][index % 4]
            }));
    }

    private createInsights(topics: Topic[]): ExploreInsight[] {
        const totalTopics = topics.length;
        const totalEngagement = topics.reduce((total, topic) => total + (topic.engagementCount ?? 0), 0);
        const highestGrowth = topics.reduce((max, topic) => Math.max(max, topic.velocityScore ?? topic.growthRate ?? 0), 0);

        return [
            {
                id: "radar",
                title: "Radar Dump",
                value: `${totalTopics} tópicos`,
                description: "Assuntos crescendo antes de virar tendência.",
                icon: "radar"
            },
            {
                id: "engagement",
                title: "Engajamento agora",
                value: this.compactNumber(totalEngagement),
                description: "Soma de likes, saves, shares e menções nos tópicos.",
                icon: "bolt"
            },
            {
                id: "creator",
                title: "Velocidade social",
                value: `+${Math.round(highestGrowth)}%`,
                description: "Crescimento dos principais tópicos no momento.",
                icon: "auto_awesome"
            }
        ];
    }

    private getTopicDescription(topic: ExploreTopic): string {
        const related = topic.postsRelated ? `${topic.postsRelated} posts relacionados` : "Posts relacionados em tempo real";
        const growth = topic.growthRate ? ` · +${Math.round(topic.growthRate)}% de velocidade` : "";

        return `${related}${growth}`;
    }

    private getTopicIcon(label: string): string {
        const normalized = label.toLowerCase();

        if (normalized.includes("dança") || normalized.includes("canto") || normalized.includes("show")) return "music_note";
        if (normalized.includes("comédia") || normalized.includes("meme")) return "mood";
        if (normalized.includes("esporte")) return "sports_soccer";
        if (normalized.includes("jogo")) return "sports_esports";
        if (normalized.includes("anime")) return "auto_awesome";
        if (normalized.includes("notícia")) return "newspaper";

        return "explore";
    }

    private getCardHeight(index: number, mediaType: string): ExplorePostCard["height"] {
        if (mediaType === "video") return index % 2 === 0 ? "xl" : "lg";

        const heights: ExplorePostCard["height"][] = ["lg", "md", "sm", "lg", "xl", "md"];
        return heights[index % heights.length];
    }

    private getPostType(mediaType: string): ExplorePostCard["type"] {
        if (mediaType === "video") return "video";
        if (mediaType === "audio") return "audio";
        return "post";
    }

    private getMockMetric(index: number, min: number, max: number): number {
        const normalized = ((index + 1) * 7919) % max;
        return Math.max(min, normalized);
    }

    private compactNumber(value: number): string {
        return new Intl.NumberFormat("pt-BR", {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(value || 0);
    }

    private slugify(value: string): string {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
}

export const exploreFacadeService = new ExploreFacadeService();
export default exploreFacadeService;