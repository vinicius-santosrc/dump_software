import { PostModel } from "@/models/feed/post.model";
import { useMemo, useState } from "react";
import { Share, View } from "react-native";
import PostMedia from "./post-components/post-media";
import PostHeader from "./post-components/post-header";
import PostComments from "./post-components/post-comments";
import PostActionsButtons from "./post-components/post-actions-buttons";
import { handleLike } from "@/services/post.service";
import { useGlobal } from "@/context/GlobalProvider";

type PostCardProps = {
    post?: PostModel | any;
    isVisible?: boolean;
} & Partial<PostModel>;

const PostCard = (props: PostCardProps) => {
    const post = props.post ?? props;
    const isVisible = props.isVisible ?? true;
    const { user } = useGlobal();
    const postId = post?.id ?? post?._id;
    const currentUserId = user?.id ?? post?.currentUserId ?? post?.current_user?.id ?? post?.viewerId;
    const initialLikes = Array.isArray(post?.likes) ? post.likes : [];
    const initialSaves = Array.isArray(post?.saves) ? post.saves : [];

    const [liked, setLiked] = useState(Boolean(currentUserId && initialLikes.includes(currentUserId)));
    const [saved, setSaved] = useState(Boolean(currentUserId && initialSaves.includes(currentUserId)));
    const [likesCount, setLikesCount] = useState(initialLikes.length);
    const [savesCount, setSavesCount] = useState(initialSaves.length);
    const [sharesCount, setSharesCount] = useState(Number(post?.sharesCount ?? post?.shares ?? 0));

    const postForActions = useMemo(() => ({
        ...post,
        id: postId,
        likes: Array.from({ length: likesCount }),
        saves: Array.from({ length: savesCount }),
        sharesCount
    }), [post, postId, likesCount, savesCount, sharesCount]);

    if (!post) {
        return null;
    }

    async function onLike() {
        if (!postId || !currentUserId) {
            return;
        }

        const previousLiked = liked;
        const nextLiked = !liked;

        setLiked(nextLiked);
        setLikesCount(previous => Math.max(0, previous + (nextLiked ? 1 : -1)));

        try {
            await handleLike(postId, currentUserId);
        } catch (error) {
            setLiked(previousLiked);
            setLikesCount(previous => Math.max(0, previous + (nextLiked ? -1 : 1)));
        }
    }

    function onSave() {
        const nextSaved = !saved;
        setSaved(nextSaved);
        setSavesCount(previous => Math.max(0, previous + (nextSaved ? 1 : -1)));
    }

    async function onSend() {
        try {
            setSharesCount(previous => previous + 1);

            await Share.share({
                message: post?.caption ? `Veja esse post no Dump: ${post.caption}` : "Veja esse post no Dump"
            });
        } catch (error) {
            setSharesCount(previous => Math.max(0, previous - 1));
            console.error("[POST_ACTIONS] Erro ao compartilhar post", error);
        }
    }

    function onComment() {
        console.log("[POST_ACTIONS] Abrir comentários do post", postId);
    }

    return (
        <View style={{ position: "relative" }}>
            <PostHeader
                user={post.user}
                post={post}
                caption={post.caption ?? ""}
            />
            <PostMedia
                postId={postId}
                media={post.media ?? []}
                isVisible={isVisible}
                onLikeChanged={(nextLiked) => {
                    setLiked(nextLiked);
                    setLikesCount(previous => {
                        if (nextLiked === liked) return previous;
                        return Math.max(0, previous + (nextLiked ? 1 : -1));
                    });
                }}
            />
            <PostActionsButtons
                post={postForActions}
                liked={liked}
                saved={saved}
                onLike={onLike}
                onComment={onComment}
                onSend={onSend}
                onSave={onSave}
            />
            <PostComments caption={post.caption ?? ""} />
        </View>
    );
};

export default PostCard;