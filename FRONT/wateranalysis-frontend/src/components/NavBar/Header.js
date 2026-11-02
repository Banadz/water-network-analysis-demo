import React from 'react';
import {
  Home,
  BarChart3,
  PieChart,
  ChevronDown,
  Bell,
  User,
  Layers
} from 'lucide-react';

const Header = ({ activeDropdown, setActiveDropdown, activeView, setActiveView }) => {
  // Nested menus avec IDs de vue
  const menuItems = [
    {
      name: "Home",
      icon: Home,
      subItems: [
        { label: "Dashboard", viewId: "dashboard" },
        { label: "Overview", viewId: "overview" },
        { label: "News", viewId: "news" }
      ]
    },
    {
      name: "Layers",
      icon: Layers,
      subItems: [
        { label: "Layer management", viewId: "map" },
        { label: "Import/Export", viewId: "import-export" },
        { label: "Settings", viewId: "settings" }
      ]
    },
    {
      name: "Analytics",
      icon: BarChart3,
      subItems: [
        { label: "Reports", viewId: "reports" },
        { label: "Trends", viewId: "trends" },
        { label: "Comparisons", viewId: "comparisons" }
      ]
    },
    {
      name: "Statistics",
      icon: PieChart,
      subItems: [
        { label: "Real time", viewId: "realtime" },
        { label: "History", viewId: "history" },
        { label: "Forecasts", viewId: "predictions" }
      ]
    }
  ];

  const handleSubItemClick = (viewId) => {
    setActiveView(viewId);
    setActiveDropdown(null);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <img 
          src="/logo/logoUF-removebg-preview.png" 
          alt="LogoUF" 
          className="h-12 w-auto object-contain"
        />
        <div className="w-px h-6 bg-gray-300" />

        <img 
          src="/logo/logoMADATLAS-removebg-preview.png" 
          alt="LogoMADATLAS" 
          className="h-12 w-auto object-contain"
        />
        <div className="w-px h-6 bg-gray-300" />
        <img 
          src="/logo/logoWNA2-removebg-preview.png" 
          alt="LogoWNA2" 
          className="h-12 w-auto object-contain"
        />
        
        <div className="flex flex-col leading-tight">
          <h1 className="text-lg font-semibold text-gray-800">
            WNA
          </h1>
        </div>
      </div>
      
      
      <nav className="hidden md:flex items-center space-x-6 relative">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === index ? null : index);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {activeDropdown === index && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {item.subItems.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-blue-600 transition-colors ${
                      activeView === subItem.viewId 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleSubItemClick(subItem.viewId)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-gray-600 hover:text-primary" />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1.5 rounded-full">
            3
          </span>
        </div>

        {/* User */}
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600 hidden md:block">
            Admin
          </span>
        </div>

      </div>
    </header>
  );
};

export default Header;