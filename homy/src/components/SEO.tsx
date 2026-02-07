import { Helmet } from "react-helmet-async";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.burrowhousing.com";
const DEFAULT_DESCRIPTION =
  "Burrow Housing – Find and list subleases for Northeastern University students. Student sublease marketplace for apartments and rooms near campus.";

export interface SEOProps {
  pageTitle: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  /** When true, use noindex (e.g. dashboard pages). Default false for public pages. */
  noIndex?: boolean;
}

const SEO = ({ pageTitle, description, canonical, ogImage, noIndex = false }: SEOProps) => {
  const desc = description || DEFAULT_DESCRIPTION;
  const url = canonical ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`) : undefined;
  const image = ogImage ? (ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`) : undefined;
  const robots = noIndex ? "noindex, follow" : "index, follow";

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{pageTitle}</title>
      <meta name="robots" content={robots} />
      <meta name="description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      {url && <link rel="canonical" href={url} />}
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Burrow Housing" />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;