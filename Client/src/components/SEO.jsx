import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteName = 'PingUp';
    const defaultDescription = 'PingUp is a modern social networking platform to connect, share media, and discover people. Join the community today.';
    const defaultImage = '/logo.svg';

    const seo = {
        title: title ? `${title} | PingUp` : 'PingUp — Connect & Share',
        description: description || defaultDescription,
        image: image || defaultImage,
        url: url || 'https://pingup.app',
    };

    return (
        <Helmet>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />
            <meta name="application-name" content={siteName} />

            {/* Open Graph */}
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:image" content={seo.image} />
            <meta property="og:url" content={seo.url} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} />

            {/* Additional */}
            <meta name="theme-color" content="#7c3aed" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={seo.url} />
        </Helmet>
    );
};

export default SEO;
