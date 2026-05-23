import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebrtcService {

    public peer?: RTCPeerConnection;

    public localStream?: MediaStream;
    public remoteStream?: MediaStream;

    async createPeer(): Promise<RTCPeerConnection> {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        });

        this.peer.onconnectionstatechange = () => {
            console.warn(
                '[WEBRTC] connection state',
                this.peer?.connectionState
            );
        };

        this.peer.oniceconnectionstatechange = () => {
            console.warn(
                '[WEBRTC] ice state',
                this.peer?.iceConnectionState
            );
        };

        this.remoteStream = new MediaStream();

        this.peer.ontrack = (event) => {

            console.warn('[WEBRTC] Remote track received', event);

            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }

            const track = event.track;

            const alreadyExists =
                this.remoteStream
                    .getTracks()
                    .some(existing => existing.id === track.id);

            if (!alreadyExists) {
                this.remoteStream.addTrack(track);
            }

            console.warn(
                '[WEBRTC] remote tracks',
                this.remoteStream.getTracks()
            );
        };

        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.warn('[WEBRTC] ICE candidate', event.candidate);
            }
        };

        return this.peer;
    }

    async initializeLocalStream(video: boolean = true): Promise<MediaStream> {

        this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video
        });

        if (this.peer) {

            this.localStream
                .getTracks()
                .forEach(track => {
                    const senderAlreadyExists =
                        this.peer
                            ?.getSenders()
                            .some(sender =>
                                sender.track?.id === track.id
                            );

                    if (!senderAlreadyExists) {
                        this.peer?.addTrack(track, this.localStream!);
                    }
                });
        }

        return this.localStream;
    }

    async createOffer(): Promise<RTCSessionDescriptionInit | undefined> {
        if (!this.peer) {
            return;
        }

        const offer = await this.peer.createOffer();

        await this.peer.setLocalDescription(offer);

        return offer;
    }

    async createAnswer(): Promise<RTCSessionDescriptionInit | undefined> {
        if (!this.peer) {
            return;
        }

        const answer = await this.peer.createAnswer();

        await this.peer.setLocalDescription(answer);

        return answer;
    }

    async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
        if (!this.peer) {
            return;
        }

        await this.peer.setRemoteDescription(
            new RTCSessionDescription(description)
        );
    }

    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        if (!this.peer) {
            return;
        }

        await this.peer.addIceCandidate(
            new RTCIceCandidate(candidate)
        );
    }

    toggleMute(): void {
        this.localStream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
    }

    toggleCamera(): void {
        this.localStream?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
    }

    destroy(): void {
        this.peer?.close();

        this.localStream?.getTracks().forEach(track => track.stop());
        this.remoteStream?.getTracks().forEach(track => track.stop());

        this.localStream = undefined;
        this.remoteStream = undefined;
        this.peer = undefined;
    }
}
