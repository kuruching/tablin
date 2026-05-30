import { Helmet } from 'react-helmet-async';
import App from '../App';

export default function JaWrapper() {
  return (
    <>
      <Helmet>
        <html lang="ja" />
        <title>ツケなう | 割り勘・立替を簡単に管理できる無料アプリ</title>
        <meta name="description" content="割り勘や立替を簡単に管理できる無料Webアプリ「ツケなう」。飲み会や旅行の支払い管理、誰がいくら払ったかをすぐに記録・確認できます。" />
        <link rel="canonical" href="https://www.xxx.com/ja" />

        <link rel="alternate" hrefLang="ja" href="https://www.xxx.com/ja" />
        <link rel="alternate" hrefLang="en" href="https://www.xxx.com/en" />
      </Helmet>

      <App />
    </>
  );
}