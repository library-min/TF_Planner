import React, { useState } from 'react';
import { Plus, Search, MessageCircle, Calendar, Users, Edit3, Save, X, FileText, Paperclip } from 'lucide-react';
import Card from '../components/Card';
import FileAttachment from '../components/FileAttachment';
import { Meeting, Comment, AttachedFile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Meetings: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
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
      attachments: [],
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
      content: `## 리뷰 항목
1. 컬러 팔레트 최종 확정
2. 컴포넌트 라이브러리 업데이트
3. 접근성 가이드라인 검토

## 결정 사항
- 주 색상을 블루 계열로 변경
- 버튼 컴포넌트에 hover 상태 추가
- 모든 텍스트 대비율 4.5:1 이상 유지

## 다음 단계
- 개발팀과 디자인 핸드오프 미팅 예정`,
      attendees: ['정수진', '김미영', '이도현'],
      attachments: [],
      comments: []
    }
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    content: '',
    attendees: ''
  });

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.attendees.some(attendee => 
      attendee.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  const handleSaveEdit = () => {
    if (selectedMeeting) {
      setMeetings(meetings.map(meeting =>
        meeting.id === selectedMeeting.id
          ? { ...meeting, content: editContent }
          : meeting
      ));
      setSelectedMeeting({ ...selectedMeeting, content: editContent });
      setIsEditing(false);
    }
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

      setMeetings(meetings.map(meeting =>
        meeting.id === selectedMeeting.id ? updatedMeeting : meeting
      ));
      setSelectedMeeting(updatedMeeting);
      setNewComment('');
    }
  };

  const handleAddMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.content) {
      const meeting: Meeting = {
        id: Date.now().toString(),
        title: newMeeting.title,
        date: newMeeting.date,
        content: newMeeting.content,
        attendees: newMeeting.attendees.split(',').map(a => a.trim()).filter(a => a),
        attachments: [],
        comments: []
      };

      setMeetings([meeting, ...meetings]);
      setNewMeeting({ title: '', date: '', content: '', attendees: '' });
      setShowAddModal(false);
    }
  };

  const renderMarkdown = (content: string) => {
    const headingClass = isDarkMode ? 'text-lg font-semibold mt-4 mb-2 text-gray-100' : 'text-lg font-semibold mt-4 mb-2 text-gray-900';
    const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
    const listItemClass = isDarkMode ? 'ml-4 my-1 text-gray-300' : 'ml-4 my-1 text-gray-700';
    const orderedListClass = isDarkMode ? 'ml-4 my-1 text-gray-300' : 'ml-4 my-1 text-gray-700';
    
    return content
      .replace(/^## (.+)$/gm, `<h3 class="${headingClass}">$1</h3>`)
      .replace(/^(\d+)\. (.+)$/gm, `<div class="${orderedListClass}">$1. $2</div>`) // 순서가 있는 리스트 (1. 2. 3.)
      .replace(/^- \[ \] (.+)$/gm, `<div class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded"> <span class="${textClass}">$1</span></div>`)
      .replace(/^- (.+)$/gm, `<li class="${listItemClass}">• $1</li>`)
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              회의록 관리
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              팀 회의록을 작성하고 관리하세요
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 회의록 작성
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="회의록 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedMeeting?.id === meeting.id
                      ? isDarkMode 
                        ? 'ring-2 ring-blue-500 bg-gray-800' 
                        : 'ring-2 ring-blue-500 bg-blue-50'
                      : isDarkMode 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{meeting.title}</h3>
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>검색 결과가 없습니다</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>다른 검색어를 시도해보세요</p>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedMeeting ? (
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                      {selectedMeeting.title}
                    </h2>
                    <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} gap-4`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedMeeting.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedMeeting.attendees.join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditContent(selectedMeeting.content);
                    }}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6">
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`w-full h-64 p-3 border rounded-lg font-mono text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="마크다운 형식으로 회의록을 작성하세요..."
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleSaveEdit}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <Save className="w-3 h-3" />
                          저장
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`inline-flex items-center gap-2 px-3 py-1 border rounded text-sm ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedMeeting.content) }}
                    />
                  )}
                </div>

                {selectedMeeting.attachments && selectedMeeting.attachments.length > 0 && (
                  <div className="mb-6">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>첨부파일</h3>
                    <div className="space-y-2">
                      {selectedMeeting.attachments.map((file) => (
                        <FileAttachment key={file.id} file={file} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                    댓글 ({selectedMeeting.comments.length})
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {selectedMeeting.comments.map((comment) => (
                      <div key={comment.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {comment.author}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTimestamp(comment.timestamp)}
                          </span>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                    회의록을 선택하세요
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    왼쪽 목록에서 회의록을 선택하면 내용을 볼 수 있습니다
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              새 회의록 작성
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  회의 제목
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="회의 제목을 입력하세요"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  회의 날짜
                </label>
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  참석자 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={newMeeting.attendees}
                  onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="김철수, 이영희, 박민수"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  회의 내용 (마크다운)
                </label>
                <textarea
                  value={newMeeting.content}
                  onChange={(e) => setNewMeeting({ ...newMeeting, content: e.target.value })}
                  className={`w-full h-48 px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="## 회의 안건
1. 첫 번째 안건
2. 두 번째 안건

## 논의 내용
- 논의된 내용을 적어주세요

## 액션 아이템
- [ ] 할 일 1
- [ ] 할 일 2"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddMeeting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                회의록 저장
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMeeting({ title: '', date: '', content: '', attendees: '' });
                }}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;