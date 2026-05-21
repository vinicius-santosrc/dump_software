export const OWNER_POST_ACTIONS = (unArchive: boolean = false): { id: string; label: string; type: string }[] => {
        return [
            { id: 'insights', label: 'Insights', type: 'normal' },
            unArchive ? { id: 'unarchive', label: 'FEED.POST.ACTIONS.UNARCHIVE', type: 'normal' } : { id: 'archive', label: 'FEED.POST.ACTIONS.ARCHIVE', type: 'normal' },
            { id: 'delete', label: 'FEED.POST.ACTIONS.DELETE', type: 'danger' }
        ]
}

export const VISITOR_POST_ACTIONS: { id: string; label: string; type: string }[] = [
    { id: 'about', label: 'FEED.POST.ACTIONS.ABOUT', type: 'normal' },
    { id: 'why', label: 'FEED.POST.ACTIONS.WHY', type: 'normal' },
    { id: 'hide', label: 'FEED.POST.ACTIONS.HIDE', type: 'normal' },
    { id: 'report', label: 'FEED.POST.ACTIONS.REPORT', type: 'danger' },
];