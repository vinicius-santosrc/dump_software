import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

type TokenType = 'text' | 'mention' | 'hashtag' | 'link' | 'emoji' | 'bold' | 'italic' | 'highlight';

type ParsedToken = {
    type: TokenType;
    value: string;
};

type GenericTextProps = {
    text?: string;
    maxCharacters?: number;
    expandable?: boolean;
    theme?: 'light' | 'dark';
    textColor?: string;
    clickableMentions?: boolean;
    clickableHashtags?: boolean;
    clickableLinks?: boolean;
    highlightTerms?: string[];
    translatedText?: string;
    enableMarkdown?: boolean;
    analyticsId?: string;
    fontSize?: number;
    onMentionPress?: (username: string) => void;
    onHashtagPress?: (hashtag: string) => void;
    onLinkPress?: (url: string) => void;
};

const tokenRegex = /(https?:\/\/[^\s]+)|(@[\p{L}0-9_.]+)|(#[\p{L}0-9_]+)|(\*\*.*?\*\*)|(\*.*?\*)|([\u{1F300}-\u{1FAFF}])/gu;

const GenericText = ({
    text = '',
    maxCharacters = 180,
    expandable = true,
    theme = 'light',
    textColor = 'none',
    clickableMentions = true,
    clickableHashtags = true,
    clickableLinks = true,
    highlightTerms = [],
    translatedText,
    enableMarkdown = true,
    analyticsId,
    fontSize = 14,
    onMentionPress,
    onHashtagPress,
    onLinkPress
}: GenericTextProps) => {
    const [expanded, setExpanded] = useState(false);

    const currentText = translatedText || text || '';
    const isLongText = currentText.length > maxCharacters;

    const displayedText = !expandable || expanded || !isLongText
        ? currentText
        : `${currentText.slice(0, maxCharacters)}...`;

    const baseColor = textColor && textColor !== 'none'
        ? textColor
        : theme === 'dark'
            ? '#ffffff'
            : '#111111';

    const tokens = useMemo(() => parseText(displayedText, highlightTerms, enableMarkdown), [displayedText, highlightTerms, enableMarkdown]);

    const handleMentionPress = (username: string) => {

        if (onMentionPress) {
            onMentionPress(username);
            return;
        }

        router.push(`profile/${username}` as never);
    };

    const handleHashtagPress = (hashtag: string) => {
        if (onHashtagPress) {
            onHashtagPress(hashtag);
            return;
        }

        router.push(`/explore/topics/${hashtag}` as never);
    };

    const handleLinkPress = async (url: string) => {

        if (onLinkPress) {
            onLinkPress(url);
            return;
        }

        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
            await Linking.openURL(url);
        }
    };

    const renderToken = (token: ParsedToken, index: number) => {
        if (token.type === 'mention') {
            return (
                <Text
                    key={`${token.type}-${token.value}-${index}`}
                    style={[styles.clickableText, { fontSize }]}
                    onPress={() => clickableMentions && handleMentionPress(token.value)}
                >
                    @{token.value}
                </Text>
            );
        }

        if (token.type === 'hashtag') {
            return (
                <Text
                    key={`${token.type}-${token.value}-${index}`}
                    style={[styles.clickableText, { fontSize }]}
                    onPress={() => clickableHashtags && handleHashtagPress(token.value)}
                >
                    #{token.value}
                </Text>
            );
        }

        if (token.type === 'link') {
            return (
                <Text
                    key={`${token.type}-${token.value}-${index}`}
                    style={[styles.linkText, { fontSize }]}
                    onPress={() => clickableLinks && handleLinkPress(token.value)}
                >
                    {token.value}
                </Text>
            );
        }

        if (token.type === 'bold') {
            return (
                <Text key={`${token.type}-${token.value}-${index}`} style={[styles.boldText, { color: baseColor, fontSize }]}> 
                    {token.value}
                </Text>
            );
        }

        if (token.type === 'italic') {
            return (
                <Text key={`${token.type}-${token.value}-${index}`} style={[styles.italicText, { color: baseColor, fontSize }]}> 
                    {token.value}
                </Text>
            );
        }

        if (token.type === 'highlight') {
            return (
                <Text key={`${token.type}-${token.value}-${index}`} style={[styles.highlightText, { color: baseColor, fontSize }]}> 
                    {token.value}
                </Text>
            );
        }

        return (
            <Text key={`${token.type}-${token.value}-${index}`} style={{ color: baseColor, fontSize }}>
                {token.value}
            </Text>
        );
    };

    return (
        <View style={styles.genericText}>
            <Text style={[styles.contentText, { color: baseColor, fontSize }]}>
                {tokens.map(renderToken)}
            </Text>

            {expandable && isLongText && (
                <Pressable style={styles.expandButton} onPress={() => setExpanded(previous => !previous)}>
                    <Text style={styles.expandText}>{expanded ? 'Ver menos' : 'Ver mais'}</Text>
                </Pressable>
            )}
        </View>
    );
};

const parseText = (text: string, highlightTerms: string[], enableMarkdown: boolean): ParsedToken[] => {
    const tokens: ParsedToken[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    tokenRegex.lastIndex = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            pushTextWithHighlights(tokens, text.slice(lastIndex, match.index), highlightTerms);
        }

        const matched = match[0];

        if (matched.startsWith('@')) {
            tokens.push({
                type: 'mention',
                value: matched.slice(1)
            });
        } else if (matched.startsWith('#')) {
            tokens.push({
                type: 'hashtag',
                value: matched.slice(1)
            });
        } else if (matched.startsWith('http')) {
            tokens.push({
                type: 'link',
                value: matched
            });
        } else if (matched.startsWith('**') && matched.endsWith('**')) {
            tokens.push({
                type: enableMarkdown ? 'bold' : 'text',
                value: matched.replace(/\*\*/g, '')
            });
        } else if (matched.startsWith('*') && matched.endsWith('*')) {
            tokens.push({
                type: enableMarkdown ? 'italic' : 'text',
                value: matched.replace(/\*/g, '')
            });
        } else {
            tokens.push({
                type: 'emoji',
                value: matched
            });
        }

        lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        pushTextWithHighlights(tokens, text.slice(lastIndex), highlightTerms);
    }

    return tokens;
};

const pushTextWithHighlights = (tokens: ParsedToken[], text: string, highlightTerms: string[]) => {
    if (!highlightTerms.length || !text) {
        tokens.push({ type: 'text', value: text });
        return;
    }

    const escapedTerms = highlightTerms
        .filter(Boolean)
        .map(escapeRegExp);

    if (!escapedTerms.length) {
        tokens.push({ type: 'text', value: text });
        return;
    }

    const highlightRegex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = highlightRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
        }

        tokens.push({ type: 'highlight', value: match[0] });
        lastIndex = highlightRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        tokens.push({ type: 'text', value: text.slice(lastIndex) });
    }
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const styles = StyleSheet.create({
    genericText: {
        width: '100%'
    },
    contentText: {
        lineHeight: 21,
        flexWrap: 'wrap'
    },
    clickableText: {
        color: '#1881E2',
        fontWeight: '600'
    },
    linkText: {
        color: '#8ab4f8',
        fontWeight: '600'
    },
    boldText: {
        fontWeight: '700'
    },
    italicText: {
        fontStyle: 'italic'
    },
    highlightText: {
        backgroundColor: 'rgba(255, 230, 0, 0.22)',
        borderRadius: 4,
        overflow: 'hidden'
    },
    expandButton: {
        marginTop: 4,
        alignSelf: 'flex-start'
    },
    expandText: {
        color: '#8e8e8e',
        fontSize: 14,
        fontWeight: '600'
    }
});

export default GenericText;