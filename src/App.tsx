import { useState } from 'react';
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
import { CFPFeedList } from './components/CFPFeedList';
// import { useNewsStore } from './lib/store';
// import { format } from 'date-fns';

const trendingTopics = [
  { topic: "Artificial Intelligence", count: 156 },
  { topic: "Climate Change", count: 143 },
  { topic: "Global Economy", count: 128 },
  { topic: "Space Exploration", count: 112 },
  { topic: "Healthcare Innovation", count: 98 }
];

const dailySummary = `Latest headlines from Citizen Free Press, providing curated news coverage on current events, politics, and trending stories.`;

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  // const [alerts, setAlerts] = useState<string[]>([]);

  // Initialize news store
  // const { cfpArticles, isLoadingCFP, fetchCFPNews } = useNewsStore();

  // Fetch CFP news on component mount
  // useEffect(() => {
  //   fetchCFPNews();
  // }, [fetchCFPNews]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // if (isLoadingCFP) {
  //   return <div>Loading news...</div>;
  // }

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
                <CFPFeedList />
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

              {/* Alerts section commented out */}
              {/* 
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
              */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
