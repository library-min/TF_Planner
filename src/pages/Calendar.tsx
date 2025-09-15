import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import Card from '../components/Card';
import { Event } from '../types';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [events] = useState<Event[]>([
    {
      id: '1',
      title: '주간 팀 미팅',
      date: '2024-01-15',
      time: '10:00',
      description: '프로젝트 진행 상황 공유 및 다음 주 계획 수립'
    },
    {
      id: '2',
      title: '클라이언트 미팅',
      date: '2024-01-17',
      time: '14:00',
      description: '프로젝트 중간 발표 및 피드백 수집'
    },
    {
      id: '3',
      title: '디자인 리뷰',
      date: '2024-01-18',
      time: '15:30',
      description: '새로운 UI/UX 디자인 최종 검토'
    },
    {
      id: '4',
      title: '코드 리뷰',
      date: '2024-01-19',
      time: '11:00',
      description: '백엔드 API 코드 리뷰 및 최적화 논의'
    },
    {
      id: '5',
      title: '프로젝트 마일스톤 체크',
      date: '2024-01-22',
      time: '16:00',
      description: '1차 개발 완료 체크 및 다음 단계 계획'
    },
    {
      id: '6',
      title: '보안 점검 회의',
      date: '2024-01-24',
      time: '09:00',
      description: '시스템 보안 취약점 점검 및 대응 방안 논의'
    },
    {
      id: '7',
      title: '월간 회고',
      date: '2024-01-30',
      time: '17:00',
      description: '1월 한 달간의 성과 및 개선점 논의'
    }
  ]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setShowEventModal(true);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getDayClassName = (date: Date) => {
    let className = 'min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors';
    
    if (!isSameMonth(date, currentDate)) {
      className += ' bg-gray-50 text-gray-400';
    }
    
    if (isToday(date)) {
      className += ' bg-blue-50 border-blue-200';
    }
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      className += ' bg-blue-100 border-blue-300';
    }
    
    return className;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">일정 캘린더</h1>
          <p className="text-gray-600 mt-2">팀 일정을 한눈에 확인하고 관리하세요</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 일정 추가
        </button>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-gray-900">
            {format(currentDate, 'yyyy년 MMMM', { locale: ko })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0 mb-4">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {/* 빈 셀들 (이전 달의 마지막 날들) */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => {
            const date = new Date(monthStart);
            date.setDate(date.getDate() - (monthStart.getDay() - index));
            return (
              <div key={`prev-${index}`} className={getDayClassName(date)}>
                <span className="text-sm">{date.getDate()}</span>
              </div>
            );
          })}

          {/* 현재 달의 날들 */}
          {calendarDays.map((date) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={date.toISOString()}
                className={getDayClassName(date)}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium">{date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{event.time} {event.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 2}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* 빈 셀들 (다음 달의 첫 날들) */}
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => {
            const date = new Date(monthEnd);
            date.setDate(date.getDate() + index + 1);
            return (
              <div key={`next-${index}`} className={getDayClassName(date)}>
                <span className="text-sm">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 선택된 날짜의 일정 목록 */}
      {selectedDate && (
        <Card title={`${format(selectedDate, 'M월 d일', { locale: ko })} 일정`}>
          <div className="space-y-3">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{event.time}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                <p>이 날짜에 등록된 일정이 없습니다.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 일정 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 일정 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="일정 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="일정에 대한 설명을 입력하세요"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 상세 모달 */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="w-5 h-5 mr-3" />
                <span>{format(new Date(selectedEvent.date), 'yyyy년 M월 d일', { locale: ko })}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="flex items-start text-gray-600">
                  <Users className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{selectedEvent.description}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;