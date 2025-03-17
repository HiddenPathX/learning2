import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

// Styled components
const CalendarContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  flex: 1;
  min-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--secondary-color), var(--primary-color));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 200px; /* 小屏幕上的最小高度 */
    padding: 1.5rem;
    margin-top: 1rem; /* 与Timer组件保持一定距离 */
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--dark-color);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NavigationButton = styled(motion.button)`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: var(--transition);
  
  &:hover {
    background-color: rgba(108, 99, 255, 0.1);
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
  }
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
  text-align: center;
`;

const Weekday = styled.div`
  font-weight: 600;
  color: var(--dark-color);
  opacity: 0.7;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  flex: 1;
  align-items: start;
  
  @media (max-width: 480px) {
    gap: 3px;
  }
`;

const DayCell = styled(motion.div)`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: ${props => props.isToday ? '700' : '400'};
  color: ${props => {
    if (props.isOutsideMonth) return '#ccc';
    if (props.isToday) return '#fff';
    return 'var(--dark-color)';
  }};
  background-color: ${props => {
    if (props.isToday) return 'var(--primary-color)';
    if (props.isCompleted) return 'var(--success-color)';
    if (props.isFailed) return 'var(--danger-color)';
    return 'transparent';
  }};
  position: relative;
  cursor: default;
  min-height: 40px;
  
  @media (max-width: 480px) {
    min-height: 30px;
    font-size: 0.8rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => props.isToday ? '2px solid var(--primary-color)' : 'none'};
    opacity: 0.3;
    pointer-events: none;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 1rem;
    gap: 0.8rem;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--dark-color);
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    gap: 0.3rem;
  }
`;

const LegendColor = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${props => props.color};
  
  @media (max-width: 480px) {
    width: 12px;
    height: 12px;
  }
`;

// Animation variants
const calendarVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.2
    }
  }
};

const dayVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  hover: { scale: 1.1 }
};

const Calendar = ({ completionHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Prepare calendar days
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    setCalendarDays(daysInMonth);
  }, [currentDate]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Check if a day is completed
  const isDayCompleted = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    return completionHistory[dateString] === true;
  };

  // Check if a day is failed (past day with no completion)
  const isDayFailed = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const isPastDay = day < new Date() && !isToday(day);
    return isPastDay && !completionHistory[dateString] && isSameMonth(day, currentDate);
  };

  // Get weekday names
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <CalendarContainer
      variants={calendarVariants}
      initial="hidden"
      animate="visible"
    >
      <CalendarHeader>
        <NavigationButton 
          onClick={prevMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </NavigationButton>
        <MonthTitle>
          {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
        </MonthTitle>
        <NavigationButton 
          onClick={nextMonth}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          →
        </NavigationButton>
      </CalendarHeader>

      <WeekdaysRow>
        {weekdays.map(day => (
          <Weekday key={day}>{day}</Weekday>
        ))}
      </WeekdaysRow>

      <DaysGrid>
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, index) => (
          <DayCell key={`empty-start-${index}`} isOutsideMonth />
        ))}
        
        {/* Days of the month */}
        {calendarDays.map(day => (
          <DayCell
            key={day.toISOString()}
            isToday={isToday(day)}
            isOutsideMonth={!isSameMonth(day, currentDate)}
            isCompleted={isDayCompleted(day)}
            isFailed={isDayFailed(day)}
            variants={dayVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            {format(day, 'd')}
          </DayCell>
        ))}
        
        {/* Empty cells for days after the end of the month */}
        {Array.from({ length: 6 - new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDay() }).map((_, index) => (
          <DayCell key={`empty-end-${index}`} isOutsideMonth />
        ))}
      </DaysGrid>

      <Legend>
        <LegendItem>
          <LegendColor color="var(--primary-color)" />
          <span>今天</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="var(--success-color)" />
          <span>已完成</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="var(--danger-color)" />
          <span>未完成</span>
        </LegendItem>
      </Legend>
    </CalendarContainer>
  );
};

export default Calendar; 