import { useEffect } from 'react';
import { useNewsStore } from '../lib/store';
import { format } from 'date-fns';

export function CFPFeedList() {
  const { cfpArticles, isLoadingCFP, fetchCFPNews } = useNewsStore();

  useEffect(() => {
    fetchCFPNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoadingCFP) {
    return <div>Loading CFP news...</div>;
  }

  return (
    <div className="space-y-4">
      {cfpArticles.map((article) => (
        <article key={article.url} className="p-4 border rounded">
          <h3 className="font-semibold">
            <a 
              href={article.original_url || article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {article.title}
            </a>
          </h3>
          <div className="text-sm text-gray-600 mt-1">
            {format(new Date(article.timestamp), 'MMM d, yyyy h:mm a')}
          </div>
        </article>
      ))}
    </div>
  );
}
