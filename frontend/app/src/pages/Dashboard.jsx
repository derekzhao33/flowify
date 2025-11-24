import React, { useState } from 'react';
import { LayoutDashboard, Calendar, List, Bot, BarChart3, Settings, User, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Plus, Search, Filter, Clock, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useSidebar } from '../components/Sidebar';
import AddTaskModal from '../components/AddTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import Sidebar from '../components/Sidebar';

const slideInStyles = `
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutToLeft {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100px);
    }
  }
`;

export default function Dashboard() {
  const { openAddTaskModal } = useModal();
  const { isCollapsed } = useSidebar();
  const [showTodaysDeadlines, setShowTodaysDeadlines] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good night';
  };

  const handleViewToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowTodaysDeadlines(!showTodaysDeadlines);
      setIsTransitioning(false);
    }, 300);
  };

  // Mock data
  const mockTasks = [
    { name: 'Complete project proposal', description: 'Finalize slides and submit', date: '2025-11-23', priority: 'high', status: 'pending' },
    { name: 'Team meeting preparation', description: 'Prepare agenda and notes', date: '2025-11-24', priority: 'medium', status: 'pending' },
    { name: 'Code review', description: 'Review pull requests', date: '2025-11-25', priority: 'medium', status: 'pending' },
    { name: 'Client presentation', description: 'Present Q4 results', date: '2025-11-26', priority: 'high', status: 'pending' },
    { name: 'Update documentation', description: 'API documentation updates', date: '2025-11-28', priority: 'low', status: 'pending' },
  ];

  const today = '2025-11-23';
  const todaysTasks = mockTasks.filter(t => t.date === today);
  const upcomingDeadlines = mockTasks.slice(0, 5);
  const weekTasks = mockTasks.filter(t => t.date >= today && t.date <= '2025-11-29');
  const monthTasks = mockTasks;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <style>{slideInStyles}</style>
      <Sidebar />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header with Search */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, John</h1>
              <p className="text-gray-500 mt-1">You have {todaysTasks.length} tasks due today</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button 
                onClick={openAddTaskModal}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>

          {/* AI Insight Banner */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Smart Suggestion</p>
              <p className="text-sm text-gray-600">You have 2 high-priority tasks due today. Consider tackling "Complete project proposal" first.</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
              View Details →
            </button>
          </div>



          {/* Stats Cards with Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingDown size={14} />
                  <span>-2 from yesterday</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{todaysTasks.length}</p>
                  <p className="text-sm text-gray-500">Tasks Remaining</p>
                </div>
                <div className="h-10 flex items-end gap-1">
                  {[3, 5, 4, 2, 1].map((height, i) => (
                    <div key={i} className="w-2 bg-blue-200 rounded-t group-hover:bg-blue-400 transition" style={{ height: `${height * 6}px` }}></div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-semibold text-gray-900">73%</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: '73%' }}></div>
                </div>
              </div>
            </div>

            {/* This Week Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">This Week</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span>+3 from last week</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{weekTasks.length}</p>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                </div>
                <div className="h-10 flex items-end gap-1">
                  {[2, 4, 5, 6, 5].map((height, i) => (
                    <div key={i} className="w-2 bg-blue-200 rounded-t group-hover:bg-blue-400 transition" style={{ height: `${height * 6}px` }}></div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">On Track</span>
                  <span className="font-semibold text-gray-900">4 / 5</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>

            {/* This Month Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">This Month</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span>+8 from last month</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{monthTasks.length}</p>
                  <p className="text-sm text-gray-500">Planned Tasks</p>
                </div>
                <div className="h-10 flex items-end gap-1">
                  {[3, 3, 4, 5, 6].map((height, i) => (
                    <div key={i} className="w-2 bg-blue-200 rounded-t group-hover:bg-blue-400 transition" style={{ height: `${height * 6}px` }}></div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Average Priority</span>
                  <span className="font-semibold text-gray-900">Medium-High</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="h-1.5 flex-1 bg-green-600 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-amber-600 rounded-full"></div>
                  <div className="h-1.5 flex-1 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              {['all', 'high', 'medium', 'low'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} Priority
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <Filter size={18} />
              More Filters
            </button>
          </div>

          {/* Deadlines Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showTodaysDeadlines ? "Today's Deadlines" : "Upcoming Deadlines"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {showTodaysDeadlines 
                    ? `${todaysTasks.length} tasks need your attention today` 
                    : `Next ${upcomingDeadlines.length} tasks in your pipeline`}
                </p>
              </div>
              <button
                onClick={handleViewToggle}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                {showTodaysDeadlines ? "View Upcoming →" : "View Today's →"}
              </button>
            </div>
            
            <div className="p-6 overflow-hidden">
              <div
                style={{
                  animation: isTransitioning ? 'slideOutToLeft 0.3s ease-in-out forwards' : 'slideInFromRight 0.3s ease-in-out forwards',
                }}
              >
                {(showTodaysDeadlines ? todaysTasks : upcomingDeadlines).length > 0 ? (
                  <div className="space-y-3">
                    {(showTodaysDeadlines ? todaysTasks : upcomingDeadlines).map((task, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <button className="w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-600 transition flex items-center justify-center group-hover:border-blue-600">
                            <CheckCircle size={14} className="text-gray-300 group-hover:text-blue-600" />
                          </button>
                          <div className="w-1 h-12 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{task.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Due Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(task.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                            task.priority === 'high' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : task.priority === 'medium' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-400 font-medium">No tasks due today</p>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up! Great job.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddTaskModal />
      <TaskDetailsModal />
    </div>
  );
}