import { Injectable } from '@angular/core';

export interface StoryGroup {
    user: any;
    stories: any[];
    lastStoryAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class StoryViewerStore {
    private groups: StoryGroup[] = [];
    private activeGroupIndex = 0;
    private activeStoryIndex = 0;
    private opened = false;

    open(groups: StoryGroup[], groupIndex: number, storyIndex: number = 0): void {
        this.groups = Array.isArray(groups) ? groups : [];
        this.activeGroupIndex = Math.max(0, Math.min(groupIndex, this.groups.length - 1));

        const activeGroup = this.groups[this.activeGroupIndex];
        const maxStoryIndex = Math.max(0, (activeGroup?.stories?.length ?? 1) - 1);
        this.activeStoryIndex = Math.max(0, Math.min(storyIndex, maxStoryIndex));
        this.opened = this.groups.length > 0;
    }

    updateGroupStoriesByUsername(username: string, stories: any[]): void {
        if (!username || !Array.isArray(stories) || stories.length === 0) {
            return;
        }

        const groupIndex = this.findGroupIndexByUsername(username);

        const hydratedGroup: StoryGroup = {
            user: stories[0]?.user ?? this.groups[groupIndex]?.user,
            stories,
            lastStoryAt: stories[0]?.createdAt ?? this.groups[groupIndex]?.lastStoryAt ?? new Date().toISOString()
        };

        if (groupIndex === -1) {
            this.groups = [...this.groups, hydratedGroup];
            this.activeGroupIndex = this.groups.length - 1;
            this.activeStoryIndex = 0;
            this.opened = true;
            return;
        }

        this.groups = this.groups.map((group, index) => {
            if (index !== groupIndex) {
                return group;
            }

            return hydratedGroup;
        });

        this.activeGroupIndex = groupIndex;

        const maxStoryIndex = Math.max(0, stories.length - 1);
        this.activeStoryIndex = Math.max(0, Math.min(this.activeStoryIndex, maxStoryIndex));
        this.opened = true;
    }

    close(): void {
        this.opened = false;
    }

    isOpened(): boolean {
        return this.opened;
    }

    getGroups(): StoryGroup[] {
        return this.groups;
    }

    getActiveGroupIndex(): number {
        return this.activeGroupIndex;
    }

    getActiveStoryIndex(): number {
        return this.activeStoryIndex;
    }

    getActiveGroup(): StoryGroup | null {
        if (!Array.isArray(this.groups) || this.groups.length === 0) {
            return null;
        }

        if (this.activeGroupIndex < 0 || this.activeGroupIndex >= this.groups.length) {
            return null;
        }

        return this.groups?.[this.activeGroupIndex] ?? null;
    }

    getActiveStory(): any | null {
        const group = this.getActiveGroup();

        if (!group || !Array.isArray(group.stories) || group.stories.length === 0) {
            return null;
        }

        if (this.activeStoryIndex < 0 || this.activeStoryIndex >= group.stories.length) {
            return null;
        }

        return group.stories?.[this.activeStoryIndex] ?? null;
    }

    setActiveGroupIndex(index: number): void {
        if (index < 0 || index >= this.groups.length) {
            return;
        }

        this.activeGroupIndex = index;
        this.activeStoryIndex = 0;
    }

    setActiveStoryIndex(index: number): void {
        const group = this.getActiveGroup();
        if (!group || index < 0 || index >= group.stories.length) {
            return;
        }

        this.activeStoryIndex = index;
    }

    setFromSingleStory(story: any) {
        this.groups = [{
            user: story.user,
            stories: [story],
            lastStoryAt: story.createdAt
        }];

        this.activeGroupIndex = 0;
        this.activeStoryIndex = 0;
        this.opened = true;
    }

    setActiveById(storyId: string) {
        for (let g = 0; g < this.groups.length; g++) {
            const index = this.groups[g].stories.findIndex(s => s.id === storyId);
            if (index !== -1) {
                this.activeGroupIndex = g;
                this.activeStoryIndex = index;
                this.opened = true;
                return;
            }
        }
    }

    next(): { changedGroup: boolean; finished: boolean } {
        const group = this.getActiveGroup();
        if (!group) {
            return { changedGroup: false, finished: true };
        }

        if (this.activeStoryIndex < group.stories.length - 1) {
            this.activeStoryIndex++;
            return { changedGroup: false, finished: false };
        }

        if (this.activeGroupIndex < this.groups.length - 1) {
            this.activeGroupIndex++;
            this.activeStoryIndex = 0;
            return { changedGroup: true, finished: false };
        }

        return { changedGroup: false, finished: true };
    }

    prev(): { changedGroup: boolean; reachedStart: boolean } {
        if (this.activeStoryIndex > 0) {
            this.activeStoryIndex--;
            return { changedGroup: false, reachedStart: false };
        }

        if (this.activeGroupIndex > 0) {
            this.activeGroupIndex--;
            const previousGroup = this.getActiveGroup();
            this.activeStoryIndex = Math.max(0, (previousGroup?.stories?.length ?? 1) - 1);
            return { changedGroup: true, reachedStart: false };
        }

        return { changedGroup: false, reachedStart: true };
    }

    findGroupIndexByUsername(username: string): number {
        return this.groups.findIndex(group => group?.user?.username === username);
    }

    findStoryIndexById(storyId: string): number {
        for (const group of this.groups) {
            const storyIndex = group.stories.findIndex(
                story => story?.id === storyId
            );

            if (storyIndex !== -1) {
                return storyIndex;
            }
        }

        return -1;
    }
}
