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
        <div key={article.url} className="border-b border-gray-700 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-100">
                <a 
                  href={article.original_url || article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {article.title}
                </a>
              </h3>
              {/* Add the summary here */}
              {article.summary && (
                <p className="text-sm text-gray-300 mt-2">
                  {article.summary}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Citizen Free Press · {format(new Date(article.timestamp), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
