import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MediaProcessingService {

    async toBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    async getImageDimensions(base64: string): Promise<{ width: string, height: string }> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64;

            img.onload = () => {
                resolve({
                    width: img.width.toString(),
                    height: img.height.toString()
                });
            };
        });
    }

    async getVideoDimensions(file: File): Promise<{ width: string, height: string }> {
        return new Promise((resolve) => {

            const video = document.createElement('video');

            const url = URL.createObjectURL(file);

            video.src = url;
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = () => {

                resolve({
                    width: video.videoWidth.toString(),
                    height: video.videoHeight.toString()
                });

                URL.revokeObjectURL(url);
            };
        });
    }

    async compressImage(file: File, MAX_WD = 1080): Promise<File> {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const base64 = await this.toBase64(file);

        return new Promise((resolve) => {
            img.onload = () => {
                const MAX_WIDTH = MAX_WD;

                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.7);
            };

            img.src = base64;
        });
    }

    async compressChatImage(file: File, maxWidth = 640, quality = 0.42): Promise<File> {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return file;
        }

        const base64 = await this.toBase64(file);

        return new Promise((resolve) => {
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = Math.round(width);
                canvas.height = Math.round(height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    const compressedName = file.name.replace(/\.[^/.]+$/, '.jpg');
                    resolve(new File([blob], compressedName, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };

            img.onerror = () => resolve(file);
            img.src = base64;
        });
    }

    async generateImageThumbnail(file: File): Promise<string> {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const base64 = await this.toBase64(file);

        return new Promise((resolve) => {
            img.onload = () => {
                const MAX_WIDTH = 150;

                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const thumb = canvas.toDataURL('image/jpeg', 0.5);
                resolve(thumb);
            };

            img.src = base64;
        });
    }

    async compressSticker(file: File, size = 72): Promise<string> {
        if (file.type === 'image/gif') {
            return this.toBase64(file);
        }

        const base64 = await this.toBase64(file);

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context unavailable'));
                return;
            }

            img.onload = () => {
                const sourceSize = Math.min(img.width, img.height);
                const sourceX = Math.max((img.width - sourceSize) / 2, 0);
                const sourceY = Math.max((img.height - sourceSize) / 2, 0);

                canvas.width = size;
                canvas.height = size;

                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(
                    img,
                    sourceX,
                    sourceY,
                    sourceSize,
                    sourceSize,
                    0,
                    0,
                    size,
                    size
                );

                const outputType = file.type === 'image/png' || file.type === 'image/webp'
                    ? 'image/webp'
                    : 'image/jpeg';

                const quality = outputType === 'image/webp' ? 0.45 : 0.5;

                resolve(canvas.toDataURL(outputType, quality));
            };

            img.onerror = () => reject(new Error('Unable to load sticker image'));
            img.src = base64;
        });
    }

    async compressAudio(input: Blob, options: { bitRate?: number; sampleRate?: number } = {}): Promise<Blob> {
        const bitRate = options.bitRate ?? 24_000;
        const sampleRate = options.sampleRate ?? 16_000;

        if (!window.MediaRecorder || !window.AudioContext) {
            return input;
        }

        const supportedMimeType = this.getSupportedAudioMimeType();

        if (!supportedMimeType) {
            return input;
        }

        try {
            const audioContext = new AudioContext({ sampleRate });
            const arrayBuffer = await input.arrayBuffer();
            const decodedAudio = await audioContext.decodeAudioData(arrayBuffer.slice(0));

            const offlineContext = new OfflineAudioContext(
                1,
                Math.ceil(decodedAudio.duration * sampleRate),
                sampleRate
            );

            const source = offlineContext.createBufferSource();
            const monoBuffer = offlineContext.createBuffer(
                1,
                Math.ceil(decodedAudio.duration * sampleRate),
                sampleRate
            );

            const inputData = decodedAudio.getChannelData(0);
            const outputData = monoBuffer.getChannelData(0);
            const ratio = decodedAudio.sampleRate / sampleRate;

            for (let index = 0; index < outputData.length; index++) {
                outputData[index] = inputData[Math.min(Math.floor(index * ratio), inputData.length - 1)] ?? 0;
            }

            source.buffer = monoBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            const renderedBuffer = await offlineContext.startRendering();
            await audioContext.close();

            return await this.encodeAudioBuffer(renderedBuffer, supportedMimeType, bitRate);
        } catch (error) {
            console.error('[MEDIA_PROCESSING] audio compression failed', error);
            return input;
        }
    }

    private getSupportedAudioMimeType(): string | null {
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];

        return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? null;
    }

    private encodeAudioBuffer(audioBuffer: AudioBuffer, mimeType: string, audioBitsPerSecond: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const audioContext = new AudioContext({ sampleRate: audioBuffer.sampleRate });
            const destination = audioContext.createMediaStreamDestination();
            const source = audioContext.createBufferSource();
            const chunks: Blob[] = [];

            source.buffer = audioBuffer;
            source.connect(destination);

            const mediaRecorder = new MediaRecorder(destination.stream, {
                mimeType,
                audioBitsPerSecond
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onerror = () => {
                audioContext.close();
                reject(new Error('Audio recorder compression error'));
            };

            mediaRecorder.onstop = () => {
                audioContext.close();
                resolve(new Blob(chunks, { type: mimeType }));
            };

            source.onended = () => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
            };

            mediaRecorder.start();
            source.start(0);
        });
    }

    async generateVideoThumbnail(file: File): Promise<string> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            const url = URL.createObjectURL(file);
            video.src = url;
            video.muted = false;
            video.playsInline = true;

            video.onloadeddata = () => {
                const seekTime = Math.min(1, video.duration / 2);
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                const MAX_WIDTH = 200;

                let width = video.videoWidth;
                let height = video.videoHeight;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(video, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', 0.6);

                URL.revokeObjectURL(url);
                resolve(base64);
            };
        });
    }

    async compressVideo(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            const url = URL.createObjectURL(file);
            video.src = url;
            video.muted = false;
            video.playsInline = true;

            video.onloadedmetadata = () => {
                const MAX_WIDTH = 720;

                let width = video.videoWidth;
                let height = video.videoHeight;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const canvasStream = canvas.captureStream(30);

                const audioContext = new AudioContext();
                const source = audioContext.createMediaElementSource(video);
                const destination = audioContext.createMediaStreamDestination();

                source.connect(destination);
                source.connect(audioContext.destination);

                const combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...destination.stream.getAudioTracks()
                ]);

                let bitrate = 800_000;

                if (width >= 1080) bitrate = 2_500_000;
                else if (width >= 720) bitrate = 1_200_000;
                else if (width >= 480) bitrate = 700_000;
                else bitrate = 400_000;

                const mediaRecorder = new MediaRecorder(combinedStream, {
                    mimeType: 'video/webm;codecs=vp9,opus',
                    videoBitsPerSecond: bitrate
                });

                const chunks: Blob[] = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
                        type: 'video/webm'
                    });

                    URL.revokeObjectURL(url);
                    resolve(compressedFile);
                };

                mediaRecorder.start();

                const drawFrame = () => {
                    if (video.paused || video.ended) {
                        mediaRecorder.stop();
                        return;
                    }

                    ctx.drawImage(video, 0, 0, width, height);
                    requestAnimationFrame(drawFrame);
                };

                audioContext.resume().then(() => {
                    video.play().then(() => drawFrame());
                });
            };

            video.onerror = reject;
        });
    }

    async processFile(file: File) {
        let processedFile = file;

        if (file.type.startsWith('image')) {
            processedFile = await this.compressImage(file);
        }

        if (file.type.startsWith('video')) {
            processedFile = await this.compressVideo(file);
        }

        const base64 = await this.toBase64(processedFile);

        let width = '';
        let height = '';
        let thumbnail = '';

        if (file.type.startsWith('image')) {
            const dimensions = await this.getImageDimensions(base64);
            width = dimensions.width;
            height = dimensions.height;

            thumbnail = await this.generateImageThumbnail(processedFile);
        }

        if (file.type.startsWith('video')) {

            const dimensions = await this.getVideoDimensions(file);

            width = dimensions.width;
            height = dimensions.height;

            thumbnail = await this.generateVideoThumbnail(file);
        }

        return {
            url: base64,
            width,
            height,
            type: file.type.startsWith('image') ? 'image' : 'video',
            thumbnail: thumbnail || base64
        };
    }
}