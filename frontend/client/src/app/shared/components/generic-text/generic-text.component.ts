import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from '../../../core/services/theme.service';

interface ParsedToken {
    type:
        | 'text'
        | 'mention'
        | 'hashtag'
        | 'link'
        | 'emoji'
        | 'markdown';

    value: string;

    html: string;
}

@Component({
    selector: 'app-generic-text',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './generic-text.component.html',
    styleUrl: './generic-text.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTextComponent implements OnChanges {

    @Input() text: string = '';

    @Input() maxCharacters: number = 180;

    @Input() expandable: boolean = true;

    @Input() theme: 'light' | 'dark' | undefined = undefined;

    @Input() textColor?: string = "none";

    @Input() clickableMentions: boolean = true;

    @Input() clickableHashtags: boolean = true;

    @Input() clickableLinks: boolean = true;

    @Input() highlightTerms: string[] = [];

    @Input() translatedText?: string;

    @Input() enableMarkdown: boolean = true;

    @Input() analyticsId?: string;

    @Output() mentionClick = new EventEmitter<string>();

    @Output() hashtagClick = new EventEmitter<string>();

    @Output() linkClick = new EventEmitter<string>();

    expanded: boolean = false;

    renderedHtml!: SafeHtml;

    private parsedTokens: ParsedToken[] = [];

    constructor(
        private readonly sanitizer: DomSanitizer,
        private readonly themeService: ThemeService
    ) { 
        if(!this.theme) this.theme = themeService.getTheme();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['text'] ||
            changes['translatedText'] ||
            changes['highlightTerms']
        ) {
            this.parseText();
        }
    }

    get currentText(): string {

        return this.translatedText || this.text || '';
    }

    get isLongText(): boolean {

        return this.currentText.length > this.maxCharacters;
    }

    get displayedText(): string {

        if (
            !this.expandable ||
            this.expanded ||
            !this.isLongText
        ) {
            return this.currentText;
        }

        return `${this.currentText.slice(0, this.maxCharacters)}...`;
    }

    toggleExpanded(): void {

        this.expanded = !this.expanded;

        this.parseText();
    }

    handleMentionClick(value: string): void {
        this.mentionClick.emit(value);
    }

    handleHashtagClick(value: string): void {
        this.hashtagClick.emit(value);
    }

    handleLinkClick(value: string): void {
        this.linkClick.emit(value);
    }

    private parseText(): void {

        const text = this.displayedText;

        const regex =
            /(https?:\/\/[^\s]+)|(@[\p{L}0-9_\.]+)|(#[\p{L}0-9_]+)|(\*\*.*?\*\*)|(\*.*?\*)|([\u{1F300}-\u{1FAFF}])/gu;

        const tokens: ParsedToken[] = [];

        let lastIndex = 0;

        let match;

        while ((match = regex.exec(text)) !== null) {

            if (match.index > lastIndex) {

                const plainText = text.slice(lastIndex, match.index);

                tokens.push({
                    type: 'text',
                    value: plainText,
                    html: this.escapeHtml(plainText)
                });
            }

            const matched = match[0];

            if (matched.startsWith('@')) {

                const username = matched.slice(1);

                tokens.push({
                    type: 'mention',
                    value: username,
                    html: this.clickableMentions
                        ? `<a class="mention" href="/${username}" data-mention="${username}">@${username}</a>`
                        : matched
                });
            }
            else if (matched.startsWith('#')) {

                const hashtag = matched.slice(1);

                tokens.push({
                    type: 'hashtag',
                    value: hashtag,
                    html: this.clickableHashtags
                        ? `<a class="hashtag" href="/explore/topics/${hashtag}" data-hashtag="${hashtag}">#${hashtag}</a>`
                        : matched
                });
            }
            else if (matched.startsWith('http')) {

                tokens.push({
                    type: 'link',
                    value: matched,
                    html: this.clickableLinks
                        ? `<a class="link" href="${matched}" target="_blank" rel="noopener noreferrer">${matched}</a>`
                        : matched
                });
            }
            else if (
                matched.startsWith('**') &&
                matched.endsWith('**')
            ) {

                const value = matched
                    .replace(/\*\*/g, '');

                tokens.push({
                    type: 'markdown',
                    value,
                    html: this.enableMarkdown
                        ? `<strong>${value}</strong>`
                        : value
                });
            }
            else if (
                matched.startsWith('*') &&
                matched.endsWith('*')
            ) {

                const value = matched
                    .replace(/\*/g, '');

                tokens.push({
                    type: 'markdown',
                    value,
                    html: this.enableMarkdown
                        ? `<em>${value}</em>`
                        : value
                });
            }
            else {

                tokens.push({
                    type: 'emoji',
                    value: matched,
                    html: matched
                });
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {

            const remaining = text.slice(lastIndex);

            tokens.push({
                type: 'text',
                value: remaining,
                html: this.escapeHtml(remaining)
            });
        }

        this.parsedTokens = tokens;

        this.renderedHtml = this.sanitizer
            .bypassSecurityTrustHtml(
                this.applyHighlights(
                    tokens.map(token => token.html).join('')
                )
            );
    }

    private applyHighlights(text: string): string {

        if (!this.highlightTerms?.length) {
            return text;
        }

        let highlighted = text;

        this.highlightTerms.forEach(term => {

            const regex = new RegExp(`(${term})`, 'gi');

            highlighted = highlighted.replace(
                regex,
                '<mark>$1</mark>'
            );
        });

        return highlighted;
    }

    private escapeHtml(text: string): string {

        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#1881E2;')
            .replace(/\n/g, '<br>');
    }
}