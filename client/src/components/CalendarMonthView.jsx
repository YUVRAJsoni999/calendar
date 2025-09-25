import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { eachWeekOfInterval, eachDayOfInterval, startOfMonth, endOfMonth, endOfWeek, format } from "date-fns";

// Popular countries list - you can expand this based on your needs
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' }
];

function CalendarMonthView({ month = new Date() }) {
  const [holidays, setHolidays] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to prevent unnecessary re-renders
  const currentRequestRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  
  // Memoize the weeks calculation - this prevents recalculation on every render
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
  }, [month]);

  // Memoize holiday lookup for better performance
  const holidayMap = useMemo(() => {
    const map = new Map();
    holidays.forEach(holiday => {
      map.set(holiday.date, holiday);
    });
    return map;
  }, [holidays]);

  // Optimized holiday counting function
  const getHolidayDays = useCallback((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.filter(d => holidayMap.has(format(d, "yyyy-MM-dd"))).length;
  }, [holidayMap]);

  // Debounced fetch function to prevent rapid API calls
  const fetchHolidays = useCallback(async (countryCode, year) => {
    // Cancel previous request
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
    }

    const requestId = { cancelled: false };
    currentRequestRef.current = requestId;

    // Only show loading state if it's not the initial load
    if (!isInitialLoadRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // Add small delay for non-initial loads to prevent flicker
      if (!isInitialLoadRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if request was cancelled
      if (requestId.cancelled) return;

      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      
      // Check again after fetch
      if (requestId.cancelled) return;

      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      
      const holidayData = await response.json();
      
      // Final check before setting state
      if (requestId.cancelled) return;

      const transformedHolidays = holidayData.map(holiday => ({
        date: holiday.date,
        localName: holiday.localName || holiday.name,
        name: holiday.name
      }));
      
      setHolidays(transformedHolidays);
      
    } catch (err) {
      if (!requestId.cancelled) {
        setError('Failed to load holidays. Please try again.');
        console.error('Error fetching holidays:', err);
        setHolidays([]); // Ensure we have a fallback
      }
    } finally {
      if (!requestId.cancelled) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }, []);

  // Effect for fetching holidays
  useEffect(() => {
    const year = format(month, 'yyyy');
    fetchHolidays(selectedCountry, year);
    
    // Cleanup function
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancelled = true;
      }
    };
  }, [selectedCountry, month, fetchHolidays]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  // Memoize current month holidays
  const currentMonthHolidays = useMemo(() => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return format(holidayDate, 'MM') === format(month, 'MM') && 
             format(holidayDate, 'yyyy') === format(month, 'yyyy');
    });
  }, [holidays, month]);

  return (
    <div style={{ 
      padding: '30px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Advanced CSS Styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .country-select {
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            border: 2px solid transparent;
            background-clip: padding-box;
            box-shadow: 
              0 4px 15px rgba(0, 0, 0, 0.1),
              inset 0 1px 3px rgba(255, 255, 255, 0.8);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
          }
          
          .country-select::before {
            content: '';
            position: absolute;
            top: 0;
            left: -200px;
            width: 200px;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent, 
              rgba(255, 255, 255, 0.4), 
              transparent
            );
            transition: left 0.5s;
          }
          
          .country-select:hover::before {
            left: calc(100% + 200px);
          }
          
          .country-select:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.15),
              0 0 20px rgba(102, 126, 234, 0.3),
              inset 0 1px 3px rgba(255, 255, 255, 0.8);
            border-color: rgba(102, 126, 234, 0.5);
          }
          
          .country-select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.15),
              0 0 0 3px rgba(102, 126, 234, 0.3);
          }
          
          .loading-spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .holiday-card {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
          }
          
          .holiday-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transform: rotate(-45deg);
            transition: all 0.3s ease;
            opacity: 0;
          }
          
          .holiday-card:hover::before {
            opacity: 1;
            transform: rotate(-45deg) translate(50%, 50%);
          }
          
          .holiday-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 
              0 20px 40px rgba(0, 0, 0, 0.2),
              0 0 30px rgba(144, 238, 144, 0.3);
          }
          
          .day-cell {
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          
          .day-cell:hover {
            transform: scale(1.1);
            z-index: 10;
          }
          
          .holiday-badge {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
            animation: pulse 2s infinite;
          }
          
          .legend-item {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .legend-item:hover {
            transform: translateX(10px);
            color: #667eea;
            font-weight: bold;
          }
          
          .main-container {
            animation: fadeIn 0.8s ease-out;
          }
          
          .error-card {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
            animation: pulse 1s infinite;
          }
        `}
      </style>

      <div className="main-container glass-card" style={{ 
        borderRadius: '20px', 
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ 
          marginBottom: '40px', 
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '3rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            🗓️ Holiday Calendar
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.1rem',
            margin: 0
          }}>
            Discover holidays around the world
          </p>
        </div>

        {/* Country Selection - Beautiful dropdown */}
        <div style={{ 
          marginBottom: '40px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🌍 Select Country:
          </label>
          
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="country-select"
            style={{
              padding: '15px 25px',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '200px',
              position: 'relative'
            }}
          >
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          
          {/* Enhanced Loading indicator */}
          {loading && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '10px 20px',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="loading-spinner" style={{ 
                width: '20px',
                height: '20px'
              }} />
              <span style={{ 
                color: 'white', 
                fontWeight: '500'
              }}>
                Loading holidays...
              </span>
            </div>
          )}
        </div>

        {/* Error State - Enhanced */}
        {error && (
          <div className="error-card" style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: 'white', 
            borderRadius: '15px',
            marginBottom: '30px',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{error}</div>
          </div>
        )}

        {/* Month Title - Enhanced */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            {format(month, 'MMMM yyyy')}
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '1.1rem',
            margin: '10px 0 0 0'
          }}>
            {COUNTRIES.find(c => c.code === selectedCountry)?.name}
          </p>
        </div>

        {/* Calendar Container - Enhanced */}
        <div style={{ 
          minHeight: '500px',
          opacity: loading && !isInitialLoadRef.current ? 0.7 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}>
          {weeks.map((weekStart, i) => {
            const holidayCount = getHolidayDays(weekStart);
            const bgColor = holidayCount === 0 ? "rgba(255, 255, 255, 0.1)" :
                           holidayCount === 1 ? "rgba(144, 238, 144, 0.3)" : 
                           "rgba(34, 139, 34, 0.4)";
            
            const textColor = "white";
            
            const weekDays = eachDayOfInterval({ 
              start: weekStart, 
              end: endOfWeek(weekStart, { weekStartsOn: 1 }) 
            });
            
            return (
              <div 
                key={i}
                className="holiday-card"
                style={{ 
                  background: bgColor,
                  color: textColor, 
                  boxShadow: holidayCount > 0 ? 
                    `0 8px 32px rgba(144, 238, 144, 0.2), 0 0 20px rgba(144, 238, 144, 0.1)` : 
                    '0 4px 15px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px',
                  padding: '20px',
                  borderRadius: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '15px',
                  minHeight: '120px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {weekDays.map((day, j) => {
                  const holiday = holidayMap.get(format(day, "yyyy-MM-dd"));
                  const isCurrentMonth = format(day, 'MM') === format(month, 'MM');
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={j}
                      className="day-cell"
                      style={{
                        opacity: isCurrentMonth ? 1 : 0.4,
                        textAlign: 'center',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '10px',
                        borderRadius: '12px',
                        background: isToday ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        border: isToday ? '2px solid rgba(255, 255, 255, 0.5)' : 'none'
                      }}
                    >
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.5rem',
                        marginBottom: '5px'
                      }}>
                        {format(day, "dd")}
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        marginBottom: '8px',
                        opacity: 0.8
                      }}>
                        {format(day, "EEE")}
                      </div>
                      {holiday && isCurrentMonth && (
                        <div 
                          className="holiday-badge"
                          style={{ 
                            fontSize: '0.8rem', 
                            color: 'white',
                            padding: '4px 8px', 
                            borderRadius: '12px',
                            marginTop: '5px',
                            fontWeight: '500'
                          }}
                        >
                          🎉 {holiday.localName.length > 15 ? 
                            holiday.localName.substring(0, 15) + '...' : 
                            holiday.localName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Holiday Legend - Enhanced */}
        {currentMonthHolidays.length > 0 && (
          <div style={{ 
            marginTop: '40px',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(15px)'
          }}>
            <h3 style={{ 
              margin: '0 0 25px 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'white',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              🎊 Holidays This Month
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {currentMonthHolidays.map((holiday, index) => (
                <div 
                  key={index}
                  className="legend-item"
                  style={{ 
                    fontSize: '1.1rem',
                    padding: '15px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px',
                    color: '#90EE90'
                  }}>
                    📅 {format(new Date(holiday.date), 'MMM dd, yyyy')}
                  </div>
                  <div style={{ fontSize: '1rem' }}>
                    {holiday.localName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarMonthView;