import { serverConfig } from '../configs/server.config';
import { AppError } from '../helpers/app-error';

// ============ API Response Types ============

interface WikipediaApiError {
    error: {
        code: string;
        info: string;
    };
}

interface WikipediaSearchResult {
    query: {
        search: Array<{
            title: string;
            snippet: string;
            pageid: number;
            size: number;
            wordcount: number;
            timestamp: string;
        }>;
    };
}

interface WikipediaPage {
    pageid: number;
    title: string;
    extract?: string;
    content?: string;
    revisions?: Array<{
        slots: {
            main: {
                '*': string;
            };
        };
        timestamp: string;
        user: string;
        comment: string;
        revid: number;
    }>;
    fullurl?: string;
    displaytitle?: string;
    touched?: string;
    length?: number;
    coordinates?: Array<{
        lat: number;
        lon: number;
    }>;
    redirects?: string[];
    categories?: Array<{
        title: string;
    }>;
    links?: Array<{
        title: string;
    }>;
    images?: Array<{
        title: string;
    }>;
    langlinks?: Array<{
        lang: string;
        '*': string;
    }>;
    imageinfo?: Array<{
        url: string;
        size: number;
        mime: string;
    }>;
}

interface WikipediaQueryResponse {
    query: {
        pages: {
            [pageId: string]: WikipediaPage;
        };
    };
}

interface WikipediaParseResult {
    parse: {
        title: string;
        pageid: number;
        text: {
            '*': string;
        };
        categories?: Array<{
            '*': string;
        }>;
        links?: Array<{
            '*': string;
            title: string;
        }>;
    };
}

interface WikipediaListResponse {
    query: {
        backlinks?: Array<{
            title: string;
            pageid: number;
        }>;
        categorymembers?: Array<{
            title: string;
            pageid: number;
        }>;
        random?: Array<{
            id: number;
            title: string;
        }>;
    };
}

type WikipediaOpenSearchResponse = [
    string, // original query
    string[], // titles
    string[], // descriptions
    string[], // urls
];

// ============ Structured Output Types ============

interface PageSection {
    title: string;
    level: number;
    content: string;
}

interface PageReference {
    text: string;
    url?: string;
}

interface PageImage {
    title: string;
    url: string;
}

interface LanguageLink {
    lang: string;
    title: string;
}

interface ComprehensivePageData {
    // Core content
    title: string;
    pageid: number;
    fullText: string;
    htmlContent: string;
    plainTextSummary: string;

    // Metadata
    url: string;
    displayTitle: string;
    lastModified: string;
    pageLength: number;
    wordCount: number;

    // Structure
    sections: PageSection[];

    // References & Links
    categories: string[];
    outgoingLinks: string[];
    externalLinks: string[];
    references: PageReference[];

    // Media
    images: PageImage[];

    // Context
    infobox?: Record<string, string>;
    coordinates?: {
        lat: number;
        lon: number;
    };

    // Related content
    relatedPages: string[];
    backlinks: string[];

    // Additional metadata for embeddings
    languageLinks: LanguageLink[];
    redirects: string[];
}

// ============ Service Class ============

export class WikipediaService {
    private readonly wikipediaApiUrl: string;
    private lastRequestTime = 0;
    private readonly minRequestInterval = 100; // 100ms between requests

    constructor() {
        this.wikipediaApiUrl = serverConfig.wikipediaApiUrl!;
    }

    async getComprehensivePageData(
        title: string
    ): Promise<ComprehensivePageData> {
        // Fetch all data in parallel
        const [
            fullContent,
            parsedContent,
            pageInfo,
            categories,
            links,
            images,
            backlinks,
            langLinks,
        ] = await Promise.all([
            this.getFullWikitext(title),
            this.getPageHtml(title),
            this.getDetailedPageInfo(title),
            this.getPageCategories(title),
            this.getPageLinks(title, 500),
            this.getPageImages(title, 100),
            this.getBacklinks(title, 50),
            this.getLanguageLinks(title),
        ]);

        // Extract page data
        const pages = fullContent.query.pages;
        const pageId = Object.keys(pages)[0];

        if (!pageId) {
            throw new AppError('Page ID not found', 404);
        }

        const page = pages[pageId];

        if (!page) {
            throw new AppError('Page data not found', 404);
        }

        // Extract wikitext
        const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
        const sections = this.extractSections(wikitext);
        const infobox = this.extractInfobox(wikitext);

        // Extract parsed data
        const htmlContent = parsedContent.parse.text['*'];
        const pageInfoData = pageInfo.query.pages[pageId];

        if (!pageInfoData) {
            throw new AppError('Page info not found', 404);
        }

        return {
            title: page.title,
            pageid: page.pageid,
            fullText: wikitext,
            htmlContent,
            plainTextSummary: this.stripWikitext(wikitext.substring(0, 5000)),

            url: pageInfoData.fullurl || '',
            displayTitle: pageInfoData.displaytitle || page.title,
            lastModified: pageInfoData.touched || '',
            pageLength: pageInfoData.length || 0,
            wordCount: this.countWords(wikitext),

            sections,

            categories: this.extractCategories(categories),
            outgoingLinks: this.extractLinks(links),
            externalLinks: this.extractExternalLinks(htmlContent),
            references: this.extractReferences(parsedContent),

            images: await this.extractImageUrls(images),

            infobox,
            coordinates: pageInfoData.coordinates?.[0],

            relatedPages: this.extractRelatedPages(parsedContent),
            backlinks: this.extractBacklinks(backlinks),

            languageLinks: this.extractLanguageLinks(langLinks),
            redirects: pageInfoData.redirects || [],
        };
    }

    async getBatchComprehensiveData(
        titles: string[]
    ): Promise<ComprehensivePageData[]> {
        const batchSize = 50;
        const results: ComprehensivePageData[] = [];

        for (let i = 0; i < titles.length; i += batchSize) {
            const batch = titles.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map((title) => this.getComprehensivePageData(title))
            );
            results.push(...batchResults);
        }

        return results;
    }

    // ============ API Methods ============

    private async getFullWikitext(
        title: string
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'revisions',
            rvprop: 'content|timestamp|user|comment|ids',
            rvslots: 'main',
            rvlimit: '1',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    private async getDetailedPageInfo(
        title: string
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'info|pageprops|coordinates|redirects',
            inprop: 'url|displaytitle|watchers|length|touched|protection',
            colimit: 'max',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getPageHtml(title: string): Promise<WikipediaParseResult> {
        const params = {
            action: 'parse',
            format: 'json',
            page: title,
            prop: 'text|categories|links',
        };

        return this.makeRequest<WikipediaParseResult>(params);
    }

    async getPageCategories(title: string): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'categories',
            cllimit: 'max',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getPageLinks(
        title: string,
        limit = 50
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'links',
            pllimit: limit.toString(),
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getPageImages(
        title: string,
        limit = 10
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'images',
            imlimit: limit.toString(),
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getBacklinks(
        title: string,
        limit = 10
    ): Promise<WikipediaListResponse> {
        const params = {
            action: 'query',
            format: 'json',
            list: 'backlinks',
            bltitle: title,
            bllimit: limit.toString(),
        };

        return this.makeRequest<WikipediaListResponse>(params);
    }

    private async getLanguageLinks(
        title: string
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'langlinks',
            lllimit: 'max',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getImageInfo(imageTitles: string[]): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: imageTitles.join('|'),
            prop: 'imageinfo',
            iiprop: 'url|size|mime|extmetadata',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async searchWikipedia(
        query: string,
        limit = 10
    ): Promise<WikipediaSearchResult> {
        const params = {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            srlimit: limit.toString(),
        };

        return this.makeRequest<WikipediaSearchResult>(params);
    }

    async getWikipediaInfo(title: string): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'extracts',
            exintro: 'true',
            explaintext: 'true',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getPageContent(title: string): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'revisions',
            rvprop: 'content',
            rvslots: 'main',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getPageSummary(
        title: string,
        sentences = 3,
        plainText = true
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'extracts',
            exsentences: sentences.toString(),
            explaintext: plainText.toString(),
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async parseWikitext(wikitext: string): Promise<WikipediaParseResult> {
        const params = {
            action: 'parse',
            format: 'json',
            text: wikitext,
            contentmodel: 'wikitext',
        };

        return this.makeRequest<WikipediaParseResult>(params);
    }

    async getRandomPages(limit = 1): Promise<WikipediaListResponse> {
        const params = {
            action: 'query',
            format: 'json',
            list: 'random',
            rnlimit: limit.toString(),
            rnnamespace: '0',
        };

        return this.makeRequest<WikipediaListResponse>(params);
    }

    async getPageInfo(title: string): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'info|pageprops',
            inprop: 'url|displaytitle|watchers',
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    async getSearchSuggestions(
        query: string,
        limit = 10
    ): Promise<WikipediaOpenSearchResponse> {
        const params = {
            action: 'opensearch',
            format: 'json',
            search: query,
            limit: limit.toString(),
        };

        return this.makeRequest<WikipediaOpenSearchResponse>(params);
    }

    async getPagesInCategory(
        category: string,
        limit = 10
    ): Promise<WikipediaListResponse> {
        const params = {
            action: 'query',
            format: 'json',
            list: 'categorymembers',
            cmtitle: category.startsWith('Category:')
                ? category
                : `Category:${category}`,
            cmlimit: limit.toString(),
        };

        return this.makeRequest<WikipediaListResponse>(params);
    }

    async expandTemplates(
        wikitext: string,
        title?: string
    ): Promise<{ expandtemplates: { wikitext: string } }> {
        const params: Record<string, string> = {
            action: 'expandtemplates',
            format: 'json',
            text: wikitext,
            prop: 'wikitext',
        };

        if (title) {
            params['title'] = title;
        }

        return this.makeRequest<{ expandtemplates: { wikitext: string } }>(
            params
        );
    }

    async comparePage(
        fromTitle: string,
        toTitle: string,
        fromRev?: number,
        toRev?: number
    ): Promise<{
        compare: { fromtitle: string; totitle: string; '*': string };
    }> {
        const params: Record<string, string> = {
            action: 'compare',
            format: 'json',
        };

        if (fromRev) {
            params['fromrev'] = fromRev.toString();
        } else {
            params['fromtitle'] = fromTitle;
        }

        if (toRev) {
            params['torev'] = toRev.toString();
        } else {
            params['totitle'] = toTitle;
        }

        return this.makeRequest<{
            compare: { fromtitle: string; totitle: string; '*': string };
        }>(params);
    }

    async getPageHistory(
        title: string,
        limit = 10
    ): Promise<WikipediaQueryResponse> {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'revisions',
            rvprop: 'ids|timestamp|user|comment|size',
            rvlimit: limit.toString(),
        };

        return this.makeRequest<WikipediaQueryResponse>(params);
    }

    // ============ Helper Methods ============

    private extractSections(wikitext: string): PageSection[] {
        const sections: PageSection[] = [];
        const sectionRegex = /^(={2,6})\s*(.+?)\s*\1$/gm;

        let lastIndex = 0;
        let match: RegExpExecArray | null;
        let currentSection: PageSection = {
            title: 'Introduction',
            level: 1,
            content: '',
        };

        while ((match = sectionRegex.exec(wikitext)) !== null) {
            currentSection.content = wikitext
                .substring(lastIndex, match.index)
                .trim();
            if (currentSection.content) {
                sections.push({ ...currentSection });
            }

            currentSection = {
                title: match[2]?.trim() || '',
                level: (match[1]?.length || 2) - 1,
                content: '',
            };
            lastIndex = match.index + match[0].length;
        }

        currentSection.content = wikitext.substring(lastIndex).trim();
        if (currentSection.content) {
            sections.push(currentSection);
        }

        return sections;
    }

    private extractInfobox(
        wikitext: string
    ): Record<string, string> | undefined {
        const infoboxRegex = /\{\{Infobox[\s\S]*?\n\}\}/i;
        const match = wikitext.match(infoboxRegex);

        if (!match) return undefined;

        const infobox: Record<string, string> = {};
        const lines = match[0].split('\n');

        for (const line of lines) {
            const paramMatch = line.match(/^\|\s*([^=]+)\s*=\s*(.+)$/);
            if (paramMatch && paramMatch[1] && paramMatch[2]) {
                const key = paramMatch[1].trim();
                const value = paramMatch[2].trim();
                infobox[key] = this.stripWikitext(value);
            }
        }

        return infobox;
    }

    private stripWikitext(text: string): string {
        return text
            .replace(/\{\{[^}]*\}\}/g, '')
            .replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, '$1')
            .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/'{2,}/g, '')
            .replace(/^\s*\|[^=]*=\s*/gm, '')
            .replace(/^\s*\|[^=]*\s*$/gm, '')
            .replace(/\s*=\s*/g, ' ')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private countWords(text: string): number {
        const cleaned = this.stripWikitext(text);
        return cleaned.split(/\s+/).filter((w) => w.length > 0).length;
    }

    private extractCategories(data: WikipediaQueryResponse): string[] {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (!pageId) return [];

        const page = pages[pageId];

        if (!page || !page.categories) return [];

        return page.categories.map((cat) => cat.title.replace('Category:', ''));
    }

    private extractLinks(data: WikipediaQueryResponse): string[] {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (!pageId) return [];

        const page = pages[pageId];

        if (!page || !page.links) return [];

        return page.links.map((link) => link.title);
    }

    private extractExternalLinks(html: string): string[] {
        const linkRegex = /href="(https?:\/\/[^"]+)"/g;
        const links: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = linkRegex.exec(html)) !== null) {
            if (match[1] && !match[1].includes('wikipedia.org')) {
                links.push(match[1]);
            }
        }

        return [...new Set(links)];
    }

    private extractReferences(
        parsedData: WikipediaParseResult
    ): PageReference[] {
        const html = parsedData.parse.text['*'];
        const refRegex = /<li[^>]*id="cite_note-[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
        const references: PageReference[] = [];
        let match: RegExpExecArray | null;

        while ((match = refRegex.exec(html)) !== null) {
            if (!match[1]) continue;

            const text = match[1].replace(/<[^>]+>/g, '').trim();
            const urlMatch = match[1].match(/href="([^"]+)"/);
            references.push({
                text,
                url: urlMatch ? urlMatch[1] : undefined,
            });
        }

        return references;
    }

    private extractRelatedPages(parsedData: WikipediaParseResult): string[] {
        const links = parsedData.parse.links || [];
        return links.slice(0, 20).map((link) => link.title || link['*'] || '');
    }

    private extractBacklinks(data: WikipediaListResponse): string[] {
        const backlinks = data.query.backlinks || [];
        return backlinks.map((bl) => bl.title);
    }

    private extractLanguageLinks(data: WikipediaQueryResponse): LanguageLink[] {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (!pageId) return [];

        const page = pages[pageId];

        if (!page || !page.langlinks) return [];

        return page.langlinks.map((ll) => ({
            lang: ll.lang,
            title: ll['*'],
        }));
    }

    private async extractImageUrls(
        data: WikipediaQueryResponse
    ): Promise<PageImage[]> {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (!pageId) return [];

        const page = pages[pageId];

        if (!page || !page.images || page.images.length === 0) return [];

        const imageTitles = page.images.slice(0, 20).map((img) => img.title);
        const imageInfo = await this.getImageInfo(imageTitles);

        const imagePages = imageInfo.query.pages;

        return Object.values(imagePages)
            .map((imgPage) => ({
                title: imgPage.title,
                url: imgPage.imageinfo?.[0]?.url || '',
            }))
            .filter((img) => img.url);
    }

    extractPageContent(data: WikipediaQueryResponse): string | null {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (!pageId) return null;

        const page = pages[pageId];

        if (!page) return null;

        return page.extract || page.content || null;
    }

    extractSearchResults(
        data: WikipediaSearchResult
    ): Array<{ title: string; snippet: string; pageid: number }> {
        return data.query.search || [];
    }

    // ============ Core Request Method ============

    private async makeRequest<T extends object>(
        params: Record<string, string>
    ): Promise<T> {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    this.minRequestInterval - timeSinceLastRequest
                )
            );
        }
        this.lastRequestTime = Date.now();

        const queryString = new URLSearchParams(params).toString();

        try {
            const response = await fetch(
                `${this.wikipediaApiUrl}?${queryString}&origin=*`
            );

            if (!response.ok) {
                throw new AppError(
                    `Wikipedia API error: ${response.status} ${response.statusText}`,
                    response.status
                );
            }

            const data = (await response.json()) as T | WikipediaApiError;

            // Type guard for error checking
            if ('error' in data) {
                const errorData = data;
                throw new AppError(
                    `Wikipedia API error: ${errorData.error.code} - ${errorData.error.info}`,
                    400
                );
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Error fetching Wikipedia data:', error);
            throw new AppError('Failed to fetch Wikipedia data', 500);
        }
    }
}

export const wikipediaService = new WikipediaService();
