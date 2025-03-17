import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import { isToday } from 'date-fns';

// Styled components
const AppContainer = styled(motion.div)`
  width: 100%;
  height: 100vh;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.2); /* 降低透明度，使背景图片更加可见 */
  backdrop-filter: none; /* 移除模糊效果 */
  border-radius: 0;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.3); /* 保留阴影效果 */
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

const Header = styled(motion.header)`
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--dark-color);
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  flex: 1;
  overflow: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
  }
`;

const TimerWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-shrink: 0; /* 防止Timer组件被压缩 */
    order: 1; /* 在移动设备上优先显示 */
  }
`;

const CalendarWrapper = styled.div`
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-shrink: 1; /* 允许Calendar组件被压缩 */
    order: 2; /* 在移动设备上次要显示 */
    overflow: auto;
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

function App() {
  // State for tracking visibility
  const [isVisible, setIsVisible] = useState(true);
  
  // State for tracking challenge completion
  const [completionHistory, setCompletionHistory] = useState(() => {
    const saved = localStorage.getItem('completionHistory');
    return saved ? JSON.parse(saved) : {};
  });

  // State for tracking today's timer
  const [todayTimer, setTodayTimer] = useState(() => {
    const saved = localStorage.getItem('todayTimer');
    return saved ? JSON.parse(saved) : { 
      startTime: null,
      elapsedTime: 0,
      isCompleted: false
    };
  });

  // Effect to handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', () => setIsVisible(false));
    window.addEventListener('focus', () => setIsVisible(true));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', () => setIsVisible(false));
      window.removeEventListener('focus', () => setIsVisible(true));
    };
  }, []);

  // Effect to save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('todayTimer', JSON.stringify(todayTimer));
  }, [todayTimer]);

  // Effect to save completion history to localStorage
  useEffect(() => {
    localStorage.setItem('completionHistory', JSON.stringify(completionHistory));
  }, [completionHistory]);

  // Effect to reset timer at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const lastDate = todayTimer.startTime ? new Date(todayTimer.startTime) : null;
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastSavedDay = lastDate ? lastDate.toISOString().split('T')[0] : null;
      
      // 检查是否是新的一天，或者应用刚刚启动
      if (!lastDate || (lastSavedDay && lastSavedDay !== today)) {
        console.log('重置计时器 - 新的一天开始了');
        // It's a new day, reset the timer
        setTodayTimer({
          startTime: now.toISOString(),
          elapsedTime: 0,
          isCompleted: false
        });
      }
    };

    // Check when the app loads
    checkForNewDay();

    // Set up an interval to check periodically
    const interval = setInterval(checkForNewDay, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Handle timer completion
  const handleTimerComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setCompletionHistory(prev => ({
      ...prev,
      [today]: true
    }));

    setTodayTimer(prev => ({
      ...prev,
      isCompleted: true
    }));
  };

  // Update elapsed time
  const updateElapsedTime = (newElapsedTime) => {
    setTodayTimer(prev => ({
      ...prev,
      elapsedTime: newElapsedTime,
      startTime: prev.startTime || new Date().toISOString()
    }));
  };

  return (
    <AppContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header variants={itemVariants}>
        <Title variants={itemVariants}>六小时学习挑战</Title>
        <Subtitle variants={itemVariants}></Subtitle>
      </Header>

      <Main>
        <TimerWrapper>
          <AnimatePresence>
            <Timer 
              isVisible={isVisible}
              initialTime={todayTimer.elapsedTime}
              isCompleted={todayTimer.isCompleted}
              onComplete={handleTimerComplete}
              onTimeUpdate={updateElapsedTime}
            />
          </AnimatePresence>
        </TimerWrapper>
        
        <CalendarWrapper>
          <Calendar completionHistory={completionHistory} />
        </CalendarWrapper>
      </Main>
    </AppContainer>
  );
}

export default App; 