import React, { useState, useEffect } from "react";
import { ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";

export default function WikiImageFetcher({ topic, searchQuery }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!topic) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        // Use Wikipedia API to fetch the main page image
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          topic
        )}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
        
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query?.pages;
        
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== "-1" && pages[pageId].thumbnail?.source) {
            setImageUrl(pages[pageId].thumbnail.source);
            setLoading(false);
            return;
          }
        }
        // No image found on Wikipedia
        setError(true);
      } catch (err) {
        console.error("Failed to fetch Wikipedia image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [topic]);

  const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    searchQuery || topic + " diagram"
  )}`;

  return (
    <div className="w-full bg-dark-card border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-2 text-text-primary font-medium text-sm">
          <ImageIcon size={16} className="text-accent-blue" />
          Educational Diagram
        </div>
        <a
          href={googleImagesUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] uppercase tracking-wider font-mono text-text-faint hover:text-accent-blue transition-colors flex items-center gap-1"
        >
          Search Images <ExternalLink size={10} />
        </a>
      </div>

      <div className="p-4 flex items-center justify-center min-h-[250px] relative">
        {loading ? (
          <div className="flex flex-col items-center text-text-faint gap-3">
            <Loader2 className="animate-spin text-accent-blue" size={24} />
            <span className="text-xs font-mono">Fetching diagram...</span>
          </div>
        ) : error || !imageUrl ? (
          <div className="flex flex-col items-center text-center p-6 gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-faint">
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-sm text-text-primary mb-1">No exact diagram found</p>
              <p className="text-xs text-text-faint mb-4">
                We couldn't securely pull a guaranteed educational image for "{topic}".
              </p>
              <a
                href={googleImagesUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/10 text-accent-blue text-xs font-semibold hover:bg-accent-blue/20 transition-colors"
              >
                View Flowcharts on Google
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center gap-3">
            <img
              src={imageUrl}
              alt={topic}
              className="max-w-full max-h-[350px] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-[10px] text-text-faint font-mono uppercase">
              Source: Wikipedia ({topic})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
