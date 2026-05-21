export function formatDateToNow(dateInput: string | Date): string {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days}d`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months}m`;
    }

    const years = Math.floor(months / 12);
    return `${years}a`;
}