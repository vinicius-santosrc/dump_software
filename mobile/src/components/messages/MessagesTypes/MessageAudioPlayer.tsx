import { SymbolView } from 'expo-symbols';
import { AudioModule, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { API_CONFIG } from '@/config/api';

type MessageAudioPlayerProps = {
    src: string;
    isMine?: boolean;
    senderAvatar?: string;
    showAvatar?: boolean;
};

const PLAYBACK_RATES = [1, 1.5, 2];

export default function MessageAudioPlayer({
    src,
    isMine = false,
    senderAvatar,
    showAvatar = true
}: MessageAudioPlayerProps) {
    const normalizedSrc = useMemo(() => normalizeAudioSource(src), [src]);
    const source = useMemo(() => ({ uri: normalizedSrc }), [normalizedSrc]);
    const player = useAudioPlayer(source);
    const status = useAudioPlayerStatus(player);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [hasLoadError, setHasLoadError] = useState(false);
    const [isPlayStarting, setIsPlayStarting] = useState(false);

    const isPlaying = !!status?.playing;
    const isLoading = !hasLoadError && (isPlayStarting || !!status?.isBuffering);
    const duration = status?.duration ?? 0;
    const currentTime = status?.currentTime ?? 0;
    const progressPercentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    useEffect(() => {
        AudioModule.setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true
        }).catch(error => {
            console.warn('[MESSAGE_AUDIO_PLAYER] audio mode failed', error);
        });
    }, []);

    useEffect(() => {
        if (status?.didJustFinish) {
            player.seekTo(0);
        }
    }, [player, status?.didJustFinish]);

    useEffect(() => {
        setHasLoadError(false);
        setIsPlayStarting(false);
    }, [normalizedSrc]);

    useEffect(() => {
        if (!isPlayStarting) {
            return;
        }

        const timeout = setTimeout(() => {
            setIsPlayStarting(false);
        }, 3500);

        return () => clearTimeout(timeout);
    }, [isPlayStarting]);

    useEffect(() => {
        if (status?.playing) {
            setIsPlayStarting(false);
        }
    }, [status?.playing]);

    async function togglePlay() {
        if (!normalizedSrc || hasLoadError) {
            return;
        }

        try {
            if (isPlaying) {
                player.pause();
                setIsPlayStarting(false);
                return;
            }

            setIsPlayStarting(true);
            player.play();
        } catch (error) {
            console.warn('[MESSAGE_AUDIO_PLAYER] play error', {
                error,
                src,
                normalizedSrc
            });
            setIsPlayStarting(false);
            setHasLoadError(true);
        }
    }

    function changePlaybackRate() {
        const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
        const nextIndex = currentIndex >= PLAYBACK_RATES.length - 1 ? 0 : currentIndex + 1;
        const nextRate = PLAYBACK_RATES[nextIndex];

        setPlaybackRate(nextRate);
        player.setPlaybackRate(nextRate);
    }

    function seekToPercentage(percent: number) {
        if (!duration) {
            return;
        }

        const nextTime = duration * percent;
        player.seekTo(nextTime);
    }

    return (
        <View style={[styles.audioPlayer, isMine && styles.audioPlayerMine]}>
            <Pressable
                style={[styles.playButton, isMine && styles.playButtonMine]}
                onPress={togglePlay}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={isMine ? '#1881E2' : '#111'} />
                ) : (
                    <SymbolView
                        name={hasLoadError ? 'exclamationmark' : isPlaying ? 'pause.fill' : 'play.fill'}
                        size={18}
                        tintColor={isMine ? '#1881E2' : '#111'}
                        weight="regular"
                    />
                )}
            </Pressable>

            {showAvatar && (
                <View style={styles.avatarBox}>
                    {senderAvatar ? (
                        <Image source={{ uri: senderAvatar }} style={styles.avatar} />
                    ) : (
                        <SymbolView name="person.fill" size={18} tintColor="#777" weight="regular" />
                    )}
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.waveRow}>
                    <Pressable style={styles.progressTrack} onPress={() => seekToPercentage(0.25)}>
                        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.time, isMine && styles.timeMine]}>
                        {formatTime(currentTime || duration)}
                    </Text>

                    <Pressable style={[styles.speedButton, isMine && styles.speedButtonMine]} onPress={changePlaybackRate}>
                        <Text style={[styles.speedText, isMine && styles.speedTextMine]}>
                            {playbackRate}x
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

function formatTime(value: number): string {
    if (!Number.isFinite(value) || value < 0) {
        return '0:00';
    }

    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function normalizeAudioSource(value?: string): string {
    const source = String(value ?? '').trim();

    if (!source) {
        return '';
    }

    let normalized = source;

    if (normalized.startsWith('http://localhost:5207')) {
        normalized = normalized.replace('http://localhost:5207', `${API_CONFIG.deviceBaseUrl}:5207`);
    }

    if (normalized.startsWith('https://localhost:5207')) {
        normalized = normalized.replace('https://localhost:5207', `${API_CONFIG.deviceBaseUrl}:5207`);
    }

    if (
        normalized.startsWith('file://') ||
        normalized.startsWith('http://') ||
        normalized.startsWith('https://') ||
        normalized.startsWith('data:audio')
    ) {
        return normalized;
    }

    const lowerSource = normalized.toLowerCase();

    if (lowerSource.startsWith('base64,')) {
        return `data:audio/m4a;base64,${normalized.substring(7)}`;
    }

    if (lowerSource.includes(';base64,')) {
        return `data:audio/m4a;base64,${normalized.split(';base64,').pop()}`;
    }

    if (isProbablyBase64Audio(normalized)) {
        return `data:audio/m4a;base64,${normalized}`;
    }

    return normalized;
}

function isProbablyBase64Audio(value: string): boolean {
    if (value.length < 80) {
        return false;
    }

    if (value.includes(' ') || value.includes('\n')) {
        return false;
    }

    return /^[A-Za-z0-9+/=]+$/.test(value);
}

const styles = StyleSheet.create({
    audioPlayer: {
        minWidth: 245,
        maxWidth: 290,
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    audioPlayerMine: {},
    playButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    playButtonMine: {
        backgroundColor: '#fff'
    },
    avatarBox: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#e9e9e9'
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17
    },
    content: {
        flex: 1,
        gap: 6
    },
    waveRow: {
        height: 18,
        justifyContent: 'center'
    },
    progressTrack: {
        height: 4,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.18)'
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.55)'
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    time: {
        fontSize: 11,
        color: 'rgba(0,0,0,0.5)',
        fontVariant: ['tabular-nums']
    },
    timeMine: {
        color: 'rgba(255,255,255,0.78)'
    },
    speedButton: {
        minWidth: 38,
        height: 22,
        paddingHorizontal: 8,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.08)'
    },
    speedButtonMine: {
        backgroundColor: 'rgba(255,255,255,0.22)'
    },
    speedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111'
    },
    speedTextMine: {
        color: '#fff'
    }
});