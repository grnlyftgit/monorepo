"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteData = exports.createMetadata = void 0;
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const applicationName = 'GrnLyft';
const author = {
    name: 'GrnLyft',
    url: 'https://grnlyft.com/',
};
const publisher = 'GrnLyft';
const twitterHandle = '@grnlyft';
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const productionUrl = process.env.PROJECT_PRODUCTION_URL;
const createMetadata = ({ title, description, image, ...properties }) => {
    const parsedTitle = `${title} | ${applicationName}`;
    const defaultMetadata = {
        title: parsedTitle,
        description,
        applicationName,
        metadataBase: productionUrl
            ? new URL(`${protocol}://${productionUrl}`)
            : undefined,
        authors: [author],
        creator: author.name,
        formatDetection: {
            telephone: false,
        },
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: parsedTitle,
        },
        openGraph: {
            title: parsedTitle,
            description,
            type: 'website',
            siteName: applicationName,
            locale: 'en_US',
        },
        publisher,
        twitter: {
            card: 'summary_large_image',
            creator: twitterHandle,
        },
    };
    const metadata = (0, lodash_merge_1.default)(defaultMetadata, properties);
    if (image && metadata.openGraph) {
        metadata.openGraph.images = [
            {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
            },
        ];
    }
    return metadata;
};
exports.createMetadata = createMetadata;
exports.siteData = {
    name: applicationName,
    url: productionUrl && `${protocol}://${productionUrl}`,
    author,
    publisher,
    twitterHandle,
};
