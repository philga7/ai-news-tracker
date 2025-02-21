import { useNewsStore } from '../lib/store';
import { format } from 'date-fns';

export function CFPSidebar() {
  const { cfpArticles } = useNewsStore();

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Citizen Free Press</h2>
      <div className="space-y-2">
        {cfpArticles.slice(0, 10).map((article) => (
          <div key={article.url} className="text-sm">
            <a 
              href={article.original_url || article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline block"
            >
              {article.title}
            </a>
            <span className="text-xs text-gray-600">
              {format(new Date(article.timestamp), 'h:mm a')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
