import React, { useState } from 'react';
import { Plus, Search, MessageCircle, Calendar, Users, Edit3, Save, X, FileText } from 'lucide-react';
import Card from '../components/Card';
import { Meeting, Comment } from '../types';

const Meetings: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: '주간 프로젝트 진행 상황 회의',
      date: '2024-01-15',
      content: `## 회의 안건
1. 지난주 완료 작업 리뷰
2. 이번주 계획 수립
3. 이슈 및 블로커 논의

## 논의 내용
- 웹사이트 리디자인 프로젝트 75% 완료
- API 문서화 작업 지연으로 인한 일정 조정 필요
- 새로운 팀원 온보딩 프로세스 개선 필요

## 액션 아이템
- [ ] API 문서 완료 (이영희, 1/18까지)
- [ ] 온보딩 가이드 업데이트 (김철수, 1/20까지)
- [ ] 다음주 스프린트 계획 수립 (팀 전체, 1/22까지)`,
      attendees: ['김철수', '이영희', '박민수', '정수진'],
      comments: [
        {
          id: '1',
          author: '이영희',
          content: 'API 문서 작업 일정이 빡빡하네요. 혹시 도움이 필요하면 말씀해 주세요.',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          author: '박민수',
          content: '온보딩 가이드에 개발 환경 설정 부분도 추가해 주시면 좋겠습니다.',
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    },
    {
      id: '2',
      title: '디자인 시스템 리뷰 미팅',
      date: '2024-01-12',
      content: `## 회의 목적
새로운 디자인 시스템 컴포넌트 리뷰 및 피드백

## 검토 항목
- 버튼 컴포넌트 variants
- 색상 팔레트 최종 확정
- 타이포그래피 가이드라인

## 결정 사항
- Primary 버튼 색상을 블루(#3B82F6)로 확정
- 헤딩 폰트를 Inter로 변경
- 모바일 반응형 가이드라인 추가 필요

## 다음 단계
- 디자인 시스템 문서화
- 개발팀에 가이드라인 공유`,
      attendees: ['이영희', '정수진', '김철수'],
      comments: []
    },
    {
      id: '3',
      title: '보안 정책 수립 회의',
      date: '2024-01-10',
      content: `## 논의 주제
개인정보보호 및 데이터 보안 정책 수립

## 주요 결정사항
1. 2FA(이중 인증) 도입 결정
2. 정기 보안 감사 계획 수립
3. 개발팀 보안 교육 실시

## 실행 계획
- 2FA 시스템 개발: 2월 말까지
- 보안 교육 일정: 매월 첫째 주 금요일
- 외부 보안 감사: 분기별 1회

## 책임자
- 2FA 개발: 박민수
- 교육 기획: 김철수
- 감사 주관: 이영희`,
      attendees: ['김철수', '이영희', '박민수'],
      comments: [
        {
          id: '3',
          author: '김철수',
          content: '보안 교육 자료 준비에 대해 외부 전문가 도움이 필요할 것 같습니다.',
          timestamp: '2024-01-10T14:20:00Z'
        }
      ]
    }
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditStart = (meeting: Meeting) => {
    setIsEditing(true);
    setEditContent(meeting.content);
  };

  const handleEditSave = () => {
    if (selectedMeeting) {
      setMeetings(meetings.map(m => 
        m.id === selectedMeeting.id ? { ...m, content: editContent } : m
      ));
      setSelectedMeeting({ ...selectedMeeting, content: editContent });
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleAddComment = () => {
    if (selectedMeeting && newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: '현재 사용자',
        content: newComment,
        timestamp: new Date().toISOString()
      };

      const updatedMeeting = {
        ...selectedMeeting,
        comments: [...selectedMeeting.comments, comment]
      };

      setMeetings(meetings.map(m => 
        m.id === selectedMeeting.id ? updatedMeeting : m
      ));
      setSelectedMeeting(updatedMeeting);
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회의록</h1>
          <p className="text-gray-600 mt-2">팀 회의 내용을 기록하고 공유하세요</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 회의록 작성
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="회의록 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMeeting?.id === meeting.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedMeeting(meeting)}
              >
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{meeting.attendees.length}명 참석</span>
                    {meeting.comments.length > 0 && (
                      <>
                        <MessageCircle className="w-4 h-4 ml-3 mr-1" />
                        <span>{meeting.comments.length}개 댓글</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredMeetings.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:w-2/3">
          {selectedMeeting ? (
            <div className="space-y-6">
              <Card>
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedMeeting.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(selectedMeeting.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>참석자: {selectedMeeting.attendees.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => handleEditStart(selectedMeeting)}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        편집
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          저장
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="prose max-w-none">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="회의록 내용을 입력하세요..."
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedMeeting.content}
                    </div>
                  )}
                </div>
              </Card>

              <Card title="댓글">
                <div className="space-y-4">
                  {selectedMeeting.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-blue-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex gap-3">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성해 주세요..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">회의록을 선택해주세요</h3>
                <p className="text-gray-500">왼쪽에서 회의록을 선택하시면 내용을 확인할 수 있습니다</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">새 회의록 작성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회의 제목</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="회의 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회의 일자</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">참석자</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="참석자 이름을 쉼표로 구분하여 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회의 내용</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  placeholder="회의 내용을 마크다운 형식으로 작성해주세요..."
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
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;