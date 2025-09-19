/**
 * 백엔드 연결 테스트 컴포넌트
 * 프론트엔드-백엔드 연결 상태를 확인하는 간단한 테스트 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { checkHealth, loginUser, getTasks } from '../utils/api';

const BackendTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('테스트 중...');
  const [loginStatus, setLoginStatus] = useState<string>('미테스트');
  const [tasksStatus, setTasksStatus] = useState<string>('미테스트');

  useEffect(() => {
    // 헬스 체크 테스트
    checkHealth()
      .then((data) => {
        setHealthStatus(`✅ ${data.message}`);
      })
      .catch((error) => {
        setHealthStatus(`❌ 연결 실패: ${error.message}`);
      });
  }, []);

  const testLogin = async () => {
    try {
      const result = await loginUser('admin@tf-planner.com', 'admin');
      setLoginStatus(`✅ ${result.message}`);
    } catch (error) {
      setLoginStatus(`❌ 로그인 실패: ${error}`);
    }
  };

  const testTasks = async () => {
    try {
      const result = await getTasks();
      setTasksStatus(`✅ ${result.message} (${result.tasks?.length || 0}개 작업)`);
    } catch (error) {
      setTasksStatus(`❌ 작업 조회 실패: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 min-w-[300px]">
      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
        🔗 백엔드 연결 테스트
      </h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>헬스 체크:</strong> {healthStatus}
        </div>
        
        <div>
          <strong>로그인 API:</strong> {loginStatus}
          <button 
            onClick={testLogin}
            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            테스트
          </button>
        </div>
        
        <div>
          <strong>작업 API:</strong> {tasksStatus}
          <button 
            onClick={testTasks}
            className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            테스트
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;