import { Helmet } from 'react-helmet-async';
import App from '../App';

export default function EnWrapper() {
  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>tablin | Split bills & track shared expenses easily</title>
        <meta name="description" content="Split bills and track shared expenses easily for trips, dinners, and group payments." />
        <link rel="canonical" href="https://www.xxx.com/en" />

        <link rel="alternate" hrefLang="ja" href="https://www.xxx.com/ja" />
        <link rel="alternate" hrefLang="en" href="https://www.xxx.com/en" />
      </Helmet>

      <App />
    </>
  );
}