import { API_CONFIG } from "@/config/api";
import { SearchResponse } from "../../models/search/search.model";

class SearchService {
    async search(query: string): Promise<SearchResponse> {
        return this.searchOnce(query);
    }

    async searchOnce(query: string): Promise<SearchResponse> {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query: `
                        query ($query: String!) {
                            search(query: $query) {
                                users {
                                    id
                                    fullName
                                    username
                                    thumbnail
                                }
                                posts {
                                    id
                                    media {
                                        width
                                        height
                                        type
                                        thumbnail
                                        url
                                    }
                                    caption
                                }
                            }
                        }
                    `,
                    variables: { query }
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status}`);
            }

            const json = await response.json();
            const data = json?.data?.search ?? json?.search ?? {};

            return {
                users: (data.users ?? []).map((user: any) => ({
                    id: user.id,
                    fullName: user.fullName,
                    username: user.username,
                    thumbnail: user.thumbnail,
                    avatarUrl: user.thumbnail
                })),
                posts: (data.posts ?? []).map((post: any) => {
                    const firstMedia = Array.isArray(post.media) ? post.media[0] : post.media;

                    return {
                        id: post.id,
                        imageUrl: firstMedia?.thumbnail ?? firstMedia?.url ?? post.imageUrl ?? "",
                        media: post.media ?? [],
                        caption: post.caption ?? ""
                    };
                })
            } as SearchResponse;
        } catch (error) {
            console.error("[SEARCH] Erro ao buscar", error);
            return {
                users: [],
                posts: []
            } as SearchResponse;
        }
    }
}

export const searchService = new SearchService();
export default searchService;
