import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Constants
const TOTAL_TIME = 6 * 60 * 60; // 6 hours in seconds

// Styled components
const TimerContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  flex: 1;
  min-width: 300px;
  height: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 250px; /* 确保在小屏幕上有足够的高度 */
    padding: 1.5rem;
  }
`;

const TimerDisplay = styled(motion.div)`
  font-size: 5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin: 1rem 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap; /* 防止换行 */
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.8rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const Progress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: 5px;
`;

const StatusMessage = styled(motion.p)`
  font-size: 1.2rem;
  color: ${props => props.isCompleted ? 'var(--success-color)' : 'var(--primary-color)'};
  margin-top: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TimerSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 5px;
  
  span {
    font-size: 5rem;
    
    @media (max-width: 768px) {
      font-size: 3.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 2.8rem;
    }
  }
  
  span:last-child {
    font-size: 2rem;
    margin-left: 5px;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
`;

const Separator = styled.span`
  font-size: 5rem;
  margin: 0 5px;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.8rem;
    margin: 0 2px;
  }
`;

// Animation variants
const timerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

const Timer = ({ isVisible, initialTime = 0, isCompleted = false, onComplete, onTimeUpdate }) => {
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME - initialTime);
  const [isPaused, setIsPaused] = useState(!isVisible);
  const [completed, setCompleted] = useState(isCompleted);
  const timerRef = useRef(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  // Calculate progress percentage
  const progressPercentage = ((TOTAL_TIME - timeRemaining) / TOTAL_TIME) * 100;
  
  // Format the time for display
  const formattedTime = formatTime(timeRemaining);

  // Effect to handle timer countdown
  useEffect(() => {
    if (completed) return;
    
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Update parent component with elapsed time
          onTimeUpdate(TOTAL_TIME - newTime);
          
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            setCompleted(true);
            onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, completed, onComplete, onTimeUpdate]);

  // Effect to handle visibility changes
  useEffect(() => {
    setIsPaused(!isVisible);
  }, [isVisible]);

  // Effect to handle completion status changes
  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  return (
    <TimerContainer
      variants={timerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <TimerDisplay>
        <TimerSection>
          <span>{formattedTime.hours}</span>
          <span>时</span>
        </TimerSection>
        <Separator>:</Separator>
        <TimerSection>
          <span>{formattedTime.minutes}</span>
          <span>分</span>
        </TimerSection>
        <Separator>:</Separator>
        <TimerSection>
          <span>{formattedTime.seconds}</span>
          <span>秒</span>
        </TimerSection>
      </TimerDisplay>
      
      <ProgressBar>
        <Progress 
          initial={{ width: `${progressPercentage}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>
      
      <StatusMessage 
        isCompleted={completed}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {completed 
          ? '恭喜你完成了今天的学习挑战！' 
          : isPaused 
            ? '计时已暂停，请保持此页面打开以继续计时' 
            : '计时进行中，请保持此页面打开'}
      </StatusMessage>
    </TimerContainer>
  );
};

export default Timer; 