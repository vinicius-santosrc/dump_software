export interface UploadItem {
    file: File;
    progress: number; // 0 - 100
    status: 'pending' | 'processing' | 'uploading' | 'success' | 'error';
    media?: any;
    error?: any;
}