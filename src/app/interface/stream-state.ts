export interface StreamState {
    playing: boolean;
    readableCurrentTime: string;
    readableDuration: string;
    duration: string;
    currentTime: string;
    volume: number;
    canplay: boolean;
    error: boolean;
}