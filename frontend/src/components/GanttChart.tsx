import React, { useMemo, useState } from 'react';
import { format, addDays, differenceInDays, parseISO, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth, getMonth, getYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Task } from '../contexts/DataContext';

interface GanttTask extends Task {
  startDate: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  className?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, className = '' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { chartData, dateRange, monthInfo } = useMemo(() => {
    const monthData = {
      year: getYear(currentMonth),
      month: getMonth(currentMonth) + 1,
      monthName: format(currentMonth, 'yyyy년 M월')
    };

    if (tasks.length === 0) {
      return { chartData: [], dateRange: [], monthInfo: monthData };
    }

    // Month view: show only current month
    const minDate = startOfMonth(currentMonth);
    const maxDate = endOfMonth(currentMonth);
    const range = eachDayOfInterval({ start: minDate, end: maxDate });

    // Calculate task positions and widths
    const chartData = tasks
      .map(task => {
        const originalStartDate = task.startDate ? parseISO(task.startDate) : addDays(parseISO(task.dueDate), -7);
        const originalEndDate = parseISO(task.dueDate);

        // Clip dates to current month view
        const clippedStartDate = originalStartDate < minDate ? minDate : originalStartDate;
        const clippedEndDate = originalEndDate > maxDate ? maxDate : originalEndDate;

        const startOffset = differenceInDays(clippedStartDate, minDate);
        const duration = differenceInDays(clippedEndDate, clippedStartDate) + 1;

        // Check if task extends beyond current month
        const extendsLeft = originalStartDate < minDate;
        const extendsRight = originalEndDate > maxDate;

        return {
          ...task,
          startOffset,
          duration,
          startDate: originalStartDate,
          endDate: originalEndDate,
          clippedStartDate,
          clippedEndDate,
          extendsLeft,
          extendsRight
        };
      })
      .filter(task => {
        // Only show tasks that overlap with current month
        return task.endDate >= minDate && task.startDate <= maxDate;
      });

    return { chartData, dateRange: range, monthInfo: monthData };
  }, [tasks, currentMonth]);

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

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleMonthYearSelect = (year: number, month: number) => {
    setCurrentMonth(new Date(year, month - 1));
    setShowDatePicker(false);
  };

  const DatePickerModal = () => {
    const [selectedYear, setSelectedYear] = useState(getYear(currentMonth));
    const currentYear = getYear(new Date());
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDatePicker(false);
          }
        }}
      >
        <div className="bg-white rounded-lg p-6 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">날짜 선택</h3>
            <button
              onClick={() => setShowDatePicker(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Year Selection */}
            <div>
              <h4 className="text-sm font-medium mb-2">년도</h4>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`p-2 text-sm rounded hover:bg-blue-50 ${
                      year === selectedYear ? 'bg-blue-500 text-white' : 'text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Selection */}
            <div>
              <h4 className="text-sm font-medium mb-2">월</h4>
              <div className="grid grid-cols-3 gap-1">
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => handleMonthYearSelect(selectedYear, month)}
                    className={`p-2 text-sm rounded hover:bg-blue-50 ${
                      selectedYear === getYear(currentMonth) && month === getMonth(currentMonth) + 1 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700'
                    }`}
                  >
                    {month}월
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                handleToday();
                setShowDatePicker(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              오늘로 이동
            </button>
          </div>
        </div>
      </div>
    );
  };

  const dayWidth = 32; // Width of each day column in pixels
  const taskHeight = 40; // Height of each task row

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">간트 차트</h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded"
            title="이전 달"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowDatePicker(true)}
            className="flex items-center space-x-2 min-w-[140px] justify-center px-3 py-2 hover:bg-gray-50 rounded border"
            title="날짜 선택"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">
              {monthInfo?.monthName}
            </span>
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
            title="다음 달"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="ml-2 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            title="오늘로 이동"
          >
            오늘
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          작업이 없습니다. 새 작업을 추가해주세요.
        </div>
      ) : (
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
                {dateRange.map((date, index) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div
                      key={index}
                      className={`flex-shrink-0 px-1 py-2 text-xs text-center border-l border-gray-200 ${
                        isWeekend ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                      } ${
                        isToday ? 'bg-yellow-100 font-bold' : ''
                      }`}
                      style={{ width: dayWidth }}
                    >
                      <div className={isToday ? 'text-yellow-700' : ''}>{format(date, 'M/d')}</div>
                      <div className={`${isWeekend ? 'text-blue-500' : 'text-gray-400'} ${isToday ? 'text-yellow-600' : ''}`}>
                        {format(date, 'EEE')}
                      </div>
                    </div>
                  );
                })}
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
                    {/* Background grid lines */}
                    <div className="absolute inset-0">
                      {dateRange.map((date, index) => {
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                        return (
                          <div
                            key={index}
                            className={`absolute top-0 bottom-0 border-l ${
                              isToday ? 'border-yellow-400 border-2' :
                              isWeekend ? 'border-blue-200' : 'border-gray-100'
                            } ${
                              isWeekend ? 'bg-blue-25' : ''
                            }`}
                            style={{ left: index * dayWidth, width: dayWidth }}
                          />
                        );
                      })}
                    </div>

                    <div className="relative h-full">
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 h-6 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} border-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm z-10 ${
                          task.extendsLeft ? 'rounded-r' : task.extendsRight ? 'rounded-l' : 'rounded'
                        }`}
                        style={{
                          left: task.startOffset * dayWidth,
                          width: Math.max(task.duration * dayWidth - 2, dayWidth * 0.5),
                        }}
                        title={`${task.title}: ${format(task.startDate, 'yyyy-MM-dd')} ~ ${format(task.endDate, 'yyyy-MM-dd')}`}
                      >
                        {/* Left arrow for tasks that start before current month */}
                        {task.extendsLeft && (
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 flex items-center justify-center">
                            <ChevronLeft className="w-3 h-3 text-white" />
                          </div>
                        )}

                        <div className="h-full flex items-center justify-center text-white text-xs font-medium px-2">
                          {task.duration > 2 ? task.title.substring(0, 10) + (task.title.length > 10 ? '...' : '') : ''}
                        </div>

                        {/* Right arrow for tasks that end after current month */}
                        {task.extendsRight && (
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-black bg-opacity-20 flex items-center justify-center">
                            <ChevronRight className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics and Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {/* Statistics */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {monthInfo?.monthName} 작업: {chartData.length}개
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded"></span>
                    <span>오늘</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-200 rounded"></span>
                    <span>주말</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
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
      )}

      {/* Date Picker Modal */}
      {showDatePicker && <DatePickerModal />}
    </div>
  );
};

export default GanttChart;