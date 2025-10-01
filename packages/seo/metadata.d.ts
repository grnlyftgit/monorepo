import type { Metadata } from 'next';
type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
    title: string;
    description: string;
    image?: string;
};
export declare const createMetadata: ({ title, description, image, ...properties }: MetadataGenerator) => Metadata;
export declare const siteData: {
    name: string;
    url: string | undefined;
    author: import("next/dist/lib/metadata/types/metadata-types").Author;
    publisher: string;
    twitterHandle: string;
};
export {};
//# sourceMappingURL=metadata.d.ts.map