import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Newspaper, 
  Search, 
  Settings, 
  Trash2,
  Home,
  Bookmark,
  TrendingUp,
  Filter,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

// Mock news data
const mockNews = [
  {
    id: 1,
    title: "AI Breakthrough: New Model Achieves Human-Level Understanding",
    source: "Tech Daily",
    timestamp: new Date(2024, 2, 15, 14, 30),
    category: "Technology",
    importance: "high",
    summary: "Latest AI model demonstrates unprecedented natural language understanding capabilities, marking a significant milestone in artificial intelligence research."
  },
  {
    id: 2,
    title: "Global Markets React to Economic Policy Changes",
    source: "Financial Times",
    timestamp: new Date(2024, 2, 15, 13, 45),
    category: "Finance",
    importance: "medium",
    summary: "Markets show volatility as central banks announce coordinated policy shifts to address inflation concerns."
  },
  {
    id: 3,
    title: "Renewable Energy Adoption Surpasses Expectations",
    source: "Green News",
    timestamp: new Date(2024, 2, 15, 12, 15),
    category: "Environment",
    importance: "high",
    summary: "Global renewable energy implementation exceeds projected targets, signaling accelerated transition to sustainable power sources."
  }
];

const trendingTopics = [
  { topic: "Artificial Intelligence", count: 156 },
  { topic: "Climate Change", count: 143 },
  { topic: "Global Economy", count: 128 },
  { topic: "Space Exploration", count: 112 },
  { topic: "Healthcare Innovation", count: 98 }
];

const dailySummary = `Today's news highlights significant developments in AI technology, 
economic policy changes affecting global markets, and accelerated adoption of renewable energy solutions. 
Key themes include technological innovation, environmental sustainability, and financial market dynamics.`;

function App() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const timer = setInterval(() => {
      const randomNews = mockNews[Math.floor(Math.random() * mockNews.length)];
      setAlerts(prev => [...prev, `Breaking: ${randomNews.title}`].slice(-5));
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const NavItem = ({ icon: Icon, label, section }: { icon: any, label: string, section: string }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-colors
        ${activeSection === section 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Left Navigation */}
      <nav className="w-64 border-r border-gray-800 p-4 space-y-4 hidden md:block">
        <div className="flex items-center space-x-2 mb-8">
          <Newspaper className="h-8 w-8 text-blue-500" />
          <h1 className="text-xl font-bold">AI News Tracker</h1>
        </div>
        <div className="space-y-2">
          <NavItem icon={Home} label="Home" section="home" />
          <NavItem icon={TrendingUp} label="Trending" section="trending" />
          <NavItem icon={Bookmark} label="Saved" section="saved" />
          <NavItem icon={Filter} label="Categories" section="categories" />
          <NavItem icon={AlertCircle} label="Alerts" section="alerts" />
          <NavItem icon={Settings} label="Settings" section="settings" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-xl">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center space-x-4 ml-4">
                <button
                  onClick={() => setNotifications(!notifications)}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  {notifications ? (
                    <BellRing className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Bell className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Headlines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Summary */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Today's Summary
                </h2>
                <p className="text-gray-300 leading-relaxed">{dailySummary}</p>
              </div>

              {/* Headlines */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Latest Headlines</h2>
                <div className="space-y-4">
                  {mockNews.map((news) => (
                    <div key={news.id} className="border-b border-gray-700 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-100">{news.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {news.source} · {format(news.timestamp, 'HH:mm')}
                          </p>
                          <p className="text-gray-300 mt-2">{news.summary}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          news.importance === 'high' 
                            ? 'bg-red-900 text-red-100' 
                            : 'bg-yellow-900 text-yellow-100'
                        }`}>
                          {news.importance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Top Topics
                </h2>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-300">{topic.topic}</span>
                      <span className="text-sm text-gray-400">{topic.count} articles</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Alerts</h2>
                  <button
                    onClick={() => setAlerts([])}
                    className="p-2 rounded-full hover:bg-gray-700"
                  >
                    <Trash2 className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-md">
                        <p className="text-gray-100">{alert}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No alerts yet</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;