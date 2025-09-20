import React, { useMemo } from 'react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { Task } from '../contexts/DataContext';

interface GanttTask extends Task {
  startDate: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  className?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, className = '' }) => {
  const { chartData, dateRange } = useMemo(() => {
    if (tasks.length === 0) {
      return { chartData: [], dateRange: [] };
    }

    // Calculate date range with fallback for missing startDate
    const startDates = tasks.map(task => {
      if (task.startDate) {
        return parseISO(task.startDate);
      }
      // Use createdAt as fallback or a date before dueDate
      const dueDate = parseISO(task.dueDate);
      return addDays(dueDate, -7); // Start 7 days before due date as default
    });
    const endDates = tasks.map(task => parseISO(task.dueDate));
    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Generate date range for header
    const range = [];
    let currentDate = minDate;
    while (currentDate <= maxDate) {
      range.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    // Calculate task positions and widths
    const chartData = tasks.map(task => {
      const startDate = task.startDate ? parseISO(task.startDate) : addDays(parseISO(task.dueDate), -7);
      const endDate = parseISO(task.dueDate);
      const startOffset = differenceInDays(startDate, minDate);
      const duration = differenceInDays(endDate, startDate) + 1;

      return {
        ...task,
        startOffset,
        duration,
        startDate: startDate,
        endDate: endDate
      };
    });

    return { chartData, dateRange: range };
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'todo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">간트 차트</h3>
        <div className="text-center py-8 text-gray-500">
          작업이 없습니다. 새 작업을 추가해주세요.
        </div>
      </div>
    );
  }

  const dayWidth = 32; // Width of each day column in pixels
  const taskHeight = 40; // Height of each task row

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">간트 차트</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Date Header */}
          <div className="flex border-b border-gray-200 mb-4">
            <div className="w-48 flex-shrink-0 px-4 py-2 font-medium text-gray-700 bg-gray-50">
              작업 이름
            </div>
            <div className="w-24 flex-shrink-0 px-2 py-2 font-medium text-gray-700 bg-gray-50 text-center">
              담당자
            </div>
            <div className="w-20 flex-shrink-0 px-2 py-2 font-medium text-gray-700 bg-gray-50 text-center">
              상태
            </div>
            <div className="flex bg-gray-50">
              {dateRange.map((date, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-1 py-2 text-xs text-gray-600 text-center border-l border-gray-200"
                  style={{ width: dayWidth }}
                >
                  <div>{format(date, 'M/d')}</div>
                  <div className="text-gray-400">{format(date, 'EEE')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-2">
            {chartData.map((task) => (
              <div key={task.id} className="flex items-center border-b border-gray-100 last:border-b-0">
                {/* Task Info */}
                <div className="w-48 flex-shrink-0 px-4 py-2">
                  <div className="font-medium text-sm text-gray-900 truncate" title={task.title}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-gray-500 truncate" title={task.description}>
                      {task.description}
                    </div>
                  )}
                </div>
                
                {/* Assignee */}
                <div className="w-24 flex-shrink-0 px-2 py-2 text-xs text-gray-600 text-center">
                  {task.assignee}
                </div>
                
                {/* Status */}
                <div className="w-20 flex-shrink-0 px-2 py-2 text-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(task.status)}`} title={task.status}></span>
                </div>

                {/* Gantt Bar */}
                <div className="flex-1 relative" style={{ height: taskHeight }}>
                  <div className="relative h-full">
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} border-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm`}
                      style={{
                        left: task.startOffset * dayWidth,
                        width: Math.max(task.duration * dayWidth - 2, dayWidth * 0.5),
                      }}
                      title={`${task.title}: ${format(task.startDate, 'yyyy-MM-dd')} ~ ${format(task.endDate, 'yyyy-MM-dd')}`}
                    >
                      <div className="h-full flex items-center justify-center text-white text-xs font-medium px-2">
                        {task.duration > 2 ? task.title.substring(0, 10) + (task.title.length > 10 ? '...' : '') : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                <span className="text-gray-600">대기</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                <span className="text-gray-600">진행중</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                <span className="text-gray-600">완료</span>
              </div>
              <div className="mx-4 border-l border-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-red-500 rounded bg-white"></span>
                <span className="text-gray-600">높은 우선순위</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-yellow-500 rounded bg-white"></span>
                <span className="text-gray-600">보통 우선순위</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-green-500 rounded bg-white"></span>
                <span className="text-gray-600">낮은 우선순위</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;