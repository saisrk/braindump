import type { Metadata, Viewport } from 'next';
import { Spectral, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Providers } from './providers';

const spectral = Spectral({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://brain-dump.co'),
  title: {
    default: 'Braindump — Externalize what you learn',
    template: '%s · Braindump',
  },
  description:
    'A knowledge externalization engine. Capture what you learn, prove you understand it, retain it with spaced repetition, and express it when it matters.',
  applicationName: 'Braindump',
  keywords: ['learning', 'spaced repetition', 'knowledge management', 'teach-back', 'interview prep', 'flashcards', 'active recall'],
  authors: [{ name: 'Braindump', url: 'https://brain-dump.co' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'Braindump',
    locale: 'en_US',
    title: 'Braindump — Remember everything you learn',
    description: 'Capture what you learn → AI flashcards → spaced repetition → teach-back.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@brain_dump_co',
    creator: '@brain_dump_co',
    title: 'Braindump — Remember everything you learn',
    description: 'Capture what you learn → AI flashcards → spaced repetition → teach-back.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2ec' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1714' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://brain-dump.co/#organization',
      name: 'Braindump',
      url: 'https://brain-dump.co',
      logo: 'https://brain-dump.co/favicon.ico',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://brain-dump.co/#website',
      url: 'https://brain-dump.co',
      name: 'Braindump',
      publisher: { '@id': 'https://brain-dump.co/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Braindump',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: 'https://brain-dump.co',
      description: 'Capture what you read, review with spaced repetition, prove understanding with teach-back and quizzes, and express your knowledge on demand.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'INR',
          description: '1 capture/day, 30 learnings lifetime, 3 teach-backs/week, 1 Express trial',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '1000',
          priceCurrency: 'INR',
          description: '10 captures/day, infinite library, unlimited teach-backs, quizzes, unlimited Express',
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Page Pulse Tracking Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  if(window.self!==window.top)return;
  var pid="dabed23e-2641-410f-89b1-231263b4bd6f";
  var tk="b27bf119-ada3-4bff-8c60-e6b017b3d538";
  var ep="https://esnubozrjxrbegatzusu.supabase.co/functions/v1/track";
  var sid=sessionStorage.getItem("_pp_sid")||Math.random().toString(36).slice(2);
  sessionStorage.setItem("_pp_sid",sid);
  var vid=localStorage.getItem("_pp_vid")||Math.random().toString(36).slice(2);
  localStorage.setItem("_pp_vid",vid);
  var lastUrl=location.href;
  function send(t,n){
    fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({page_id:pid,token:tk,url:location.href,referrer:document.referrer,
        user_agent:navigator.userAgent,screen_width:screen.width,
        session_id:sid,visitor_id:vid,event_type:t,element_name:n||null})});
  }
  send("pageview");
  document.addEventListener("click",function(e){
    var el=e.target.closest("a,button,[role='button'],input[type='submit']");
    if(!el)return;
    var p=el;while(p){var s=getComputedStyle(p);if(s.position==="fixed"||s.position==="sticky"){var r=p.getBoundingClientRect();if(r.width>window.innerWidth*0.4&&r.height>window.innerHeight*0.3)return;}p=p.parentElement;}
    var name=el.getAttribute("data-pp")||el.innerText||el.getAttribute("aria-label")||el.tagName;
    if(name)send("click",name.trim().substring(0,100));
  });
  function checkUrl(){if(location.href!==lastUrl){lastUrl=location.href;send("pageview");}}
  var origPush=history.pushState;history.pushState=function(){origPush.apply(this,arguments);checkUrl();};
  var origReplace=history.replaceState;history.replaceState=function(){origReplace.apply(this,arguments);checkUrl();};
  window.addEventListener("popstate",checkUrl);
  setInterval(function(){if(!document.hidden)send("ping");},15000);
  var _cc={};
  function trackConversion(label){var k=label||"_";if(_cc[k])return;_cc[k]=1;send("conversion",label||null);}
  window.PagePulse=window.PagePulse||{};
  window.PagePulse.trackConversion=trackConversion;
  window.pagePulse=window.PagePulse;
  var _v={cls:0,inp:0};
  try{
    if(window.PerformanceObserver){
      try{new PerformanceObserver(function(l){var e=l.getEntries();if(e.length)_v.lcp=Math.round(e[e.length-1].startTime);}).observe({type:"largest-contentful-paint",buffered:true});}catch(e){}
      try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(!e.hadRecentInput)_v.cls+=e.value;});}).observe({type:"layout-shift",buffered:true});}catch(e){}
      try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.duration>_v.inp)_v.inp=Math.round(e.duration);});}).observe({type:"event",buffered:true,durationThreshold:40});}catch(e){}
    }
  }catch(e){}
  function flushVitals(){
    if(_v._sent)return;_v._sent=1;
    try{var nt=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(nt&&nt.loadEventEnd)_v.load=Math.round(nt.loadEventEnd);}catch(e){}
    var dt=(screen.width&&screen.width<768)?"mobile":"desktop";
    var payload={page_id:pid,token:tk,url:location.href,session_id:sid,event_type:"vitals",vitals:{lcp:_v.lcp||null,cls:_v.cls?Math.round(_v.cls*1000)/1000:null,inp:_v.inp||null,load_time:_v.load||null,device_type:dt}};
    try{if(navigator.sendBeacon){navigator.sendBeacon(ep,new Blob([JSON.stringify(payload)],{type:"application/json"}));}else{fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),keepalive:true});}}catch(e){}
  }
  addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flushVitals();});
  addEventListener("pagehide",flushVitals);
})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
