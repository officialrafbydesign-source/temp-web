"use client";

import { Instagram, Twitter, Youtube, ArrowUpRight } from "lucide-react";

type FeedItem = {
  id: number;
  platform: "Instagram" | "X / Twitter" | "YouTube";
  icon: React.ReactNode;
  tag: string;
  date: string;
  content: string;
  image?: string | null;
  link: string;
};

export default function SocialNewsFeed() {
  // Option A Curated Feed Data Matrix
  const feedItems: FeedItem[] = [
    {
      id: 1,
      platform: "Instagram",
      icon: <Instagram className="w-4 h-4 text-pink-500" />,
      tag: "@rafbydesign",
      date: "2 hours ago",
      content: "Just dropped the new 'Vanguard' Hyperpop kit inside the store. 808s hitting different on this one. Link in bio to lease! 🔊🔥",
      image: "/images/mascotmonored.png",
      link: "https://instagram.com"
    },
    {
      id: 2,
      platform: "X / Twitter",
      icon: <Twitter className="w-4 h-4 text-sky-400" />,
      tag: "@rafbydesign",
      date: "Yesterday",
      content: "Locked in the studio all weekend finishing up the production catalog for Q3. If you are an independent artist looking for customized structural mixing, DM me.",
      image: null,
      link: "https://twitter.com"
    }
  ];

  return (
    <section className="py-20 bg-black border-t border-red-500/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs uppercase font-black tracking-[0.3em] text-red-500 font-mono">
              Stay Connected
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mt-2 text-white raf-heading tracking-wide">
              Studio News Feed
            </h2>
          </div>
          <p className="text-white/40 text-sm max-w-sm md:text-right">
            Real-time industry updates, sample kit rollouts, and direct placements straight from the studio floor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {feedItems.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-[2rem] border border-red-500/25 bg-neutral-950/40 backdrop-blur-sm p-6 hover:border-red-400/60 transition-all duration-300 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-mono text-white/70">{item.tag}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-white/30">{item.date}</span>
                </div>

                <p className="text-sm text-white/80 leading-relaxed font-sans whitespace-pre-line">
                  {item.content}
                </p>

                {item.image && (
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-white/5 bg-black/60 p-2">
                    <img
                      src={item.image}
                      alt="Studio update"
                      className="w-full h-full object-contain group-hover:scale-102 transition duration-500"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-widest pt-3 border-t border-white/5">
                View Post <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          ))}

          {/* Persistent Call-to-action Block */}
          <div className="rounded-[2rem] border border-dashed border-red-500/30 bg-red-950/10 p-6 flex flex-col justify-between text-center items-center">
            <div className="my-auto space-y-4 py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white raf-heading">Live Sessions</h4>
                <p className="text-xs text-white/50 mt-2 max-w-[220px] mx-auto leading-relaxed">
                  Catch full layout cookups live on YouTube or coordinate tracking stems directly inside our community channels.
                </p>
              </div>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-red-600 text-white text-xs font-black tracking-widest uppercase hover:bg-red-500 transition-all duration-200 shadow-md shadow-red-950/50"
            >
              Subscribe on YouTube
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}