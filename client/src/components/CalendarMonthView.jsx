import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { eachWeekOfInterval, eachDayOfInterval, startOfMonth, endOfMonth, endOfWeek, format, addDays, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

function CalendarMonthView({ month: initialMonth = new Date() }) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [holidays, setHolidays] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const currentRequestRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const loadingTimeoutRef = useRef(null);
  
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
  }, [currentMonth]);

  const holidayMap = useMemo(() => {
    const map = new Map();
    holidays.forEach(holiday => {
      map.set(holiday.date, holiday);
    });
    return map;
  }, [holidays]);

  const hasConsecutiveHolidays = useCallback((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    for (let i = 0; i < days.length - 1; i++) {
      const currentDay = format(days[i], "yyyy-MM-dd");
      const nextDay = format(days[i + 1], "yyyy-MM-dd");
      
      if (holidayMap.has(currentDay) && holidayMap.has(nextDay)) {
        return true;
      }
    }
    
    if (days.length > 0) {
      const firstDay = format(days[0], "yyyy-MM-dd");
      const dayBeforeWeek = format(addDays(days[0], -1), "yyyy-MM-dd");
      
      if (holidayMap.has(dayBeforeWeek) && holidayMap.has(firstDay)) {
        return true;
      }
    }
    
    return false;
  }, [holidayMap]);

  const getHolidayDays = useCallback((weekStart) => {//counter
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.filter(d => holidayMap.has(format(d, "yyyy-MM-dd"))).length;
  }, [holidayMap]);

  const fetchHolidays = useCallback(async (countryCode, year) => {
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    const requestId = { cancelled: false };
    currentRequestRef.current = requestId;

    // Delay loading indicator to prevent flutter
    if (!isInitialLoadRef.current) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (!requestId.cancelled) {
          setLoading(true);
        }
      }, 300);
    }

    setError(null);
      
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      
      if (requestId.cancelled) return;

      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }
      
      const holidayData = await response.json();
      
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
        setHolidays([]);
      }
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (!requestId.cancelled) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    const year = format(currentMonth, 'yyyy');
    fetchHolidays(selectedCountry, year);
    
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancelled = true;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [selectedCountry, currentMonth, fetchHolidays]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const currentMonthHolidays = useMemo(() => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return format(holidayDate, 'MM') === format(currentMonth, 'MM') && 
             format(holidayDate, 'yyyy') === format(currentMonth, 'yyyy');
    });
  }, [holidays, currentMonth]);

  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .professional-card {
            background: white;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          
          .country-select {
            background: white;
            border: 1px solid #ced4da;
            transition: all 0.2s ease;
            font-weight: 500;
          }
          
          .country-select:hover {
            border-color: #4285f4;
            box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
          }
          
          .country-select:focus {
            outline: none;
            border-color: #4285f4;
            box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
          }
          
          .nav-button {
            background: white;
            border: 1px solid #ced4da;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;
            height: 40px;
            color: #495057;
          }
          
          .nav-button:hover {
            border-color: #4285f4;
            background-color: #f8f9fa;
            color: #4285f4;
          }
          
          .nav-button:active {
            transform: translateY(1px);
          }
          
          .loading-spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #4285f4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .loading-indicator {
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
          }
          
          .loading-indicator.visible {
            opacity: 1;
            transform: translateY(0);
          }
          
          .week-row {
            transition: all 0.2s ease;
            border: 1px solid #e9ecef;
          }
          
          .week-row:hover {
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          }
          
          .day-cell {
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .day-cell:hover {
            background-color: #f8f9fa;
          }
          
          .holiday-badge {
            background-color: #dc3545;
            color: white;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .legend-item {
            transition: all 0.2s ease;
            border: 1px solid #e9ecef;
          }
          
          .legend-item:hover {
            border-color: #4285f4;
            box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
          }
          
          .error-card {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
          }
        `}
      </style>

      <div className="professional-card" style={{ 
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '24px'
        }}>
          <h1 style={{ 
            fontSize: '2rem',
            fontWeight: '600',
            color: '#212529',
            margin: '0 0 8px 0'
          }}>
            Holiday Calendar
          </h1>
          <p style={{ 
            color: '#6c757d',
            fontSize: '1rem',
            margin: 0
          }}>
            View public holidays by country and month
          </p>
        </div>

        {/* Controls */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          minHeight: '56px'
        }}>
          <label style={{ 
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#495057',
            minWidth: '60px'
          }}>
            Country:
          </label>
          
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="country-select"
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              minWidth: '180px',
              height: '36px'
            }}
          >
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          
          {/* Loading indicator with consistent positioning */}
          <div 
            className={`loading-indicator ${loading ? 'visible' : ''}`}
            style={{ 
              display: loading ? 'flex' : 'none',
              alignItems: 'center',
              gap: '8px',
              color: '#6c757d',
              fontSize: '0.875rem',
              marginLeft: '8px'
            }}
          >
            <div className="loading-spinner" style={{ 
              width: '16px',
              height: '16px'
            }} />
            <span>Loading...</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-card" style={{ 
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '24px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Month Navigation */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '32px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <button 
            onClick={handlePreviousMonth}
            className="nav-button"
            title="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ 
            textAlign: 'center',
            minWidth: '200px'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#212529',
              margin: '0 0 4px 0'
            }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p style={{ 
              color: '#6c757d',
              fontSize: '0.875rem',
              margin: 0
            }}>
              {COUNTRIES.find(c => c.code === selectedCountry)?.name}
            </p>
          </div>

          <button 
            onClick={handleNextMonth}
            className="nav-button"
            title="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar */}
        <div style={{ minHeight: '400px' }}>
          {weeks.map((weekStart, i) => {
            const holidayCount = getHolidayDays(weekStart);
            const hasConsecutive = hasConsecutiveHolidays(weekStart);
            
            let weekBgColor = 'white';
            
            // Priority: consecutive holidays > multiple holidays > single holiday
            if (hasConsecutive) {
              weekBgColor = '#fff9c4'; // Yellow for consecutive holidays
            } else if (holidayCount > 1) {
              weekBgColor = '#c8e6c9'; // Dark green for multiple holidays
            } else if (holidayCount === 1) {
              weekBgColor = '#e8f5e8'; // Light green for single holiday
            }
            
            const weekDays = eachDayOfInterval({ 
              start: weekStart, 
              end: endOfWeek(weekStart, { weekStartsOn: 1 }) 
            });
            
            return (
              <div 
                key={i}
                className="week-row"
                style={{ 
                  backgroundColor: weekBgColor,
                  marginBottom: '1px',
                  borderRadius: '4px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  minHeight: '100px'
                }}
              >
                {weekDays.map((day, j) => {
                  const holiday = holidayMap.get(format(day, "yyyy-MM-dd"));
                  const isViewingCurrentMonth = format(day, 'MM') === format(currentMonth, 'MM');
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={j}
                      className="day-cell"
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        borderRight: j < 6 ? '1px solid #e9ecef' : 'none',
                        opacity: isViewingCurrentMonth ? 1 : 0.5,
                        backgroundColor: isToday ? '#e3f2fd' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <div style={{ 
                        fontWeight: isToday ? '600' : '500',
                        fontSize: '1.1rem',
                        color: isToday ? '#1976d2' : '#212529'
                      }}>
                        {format(day, "dd")}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#6c757d',
                        marginBottom: '4px'
                      }}>
                        {format(day, "EEE")}
                      </div>
                      {holiday && isViewingCurrentMonth && (
                        <div 
                          className="holiday-badge"
                          style={{ 
                            padding: '2px 6px',
                            borderRadius: '3px',
                            textAlign: 'center',
                            lineHeight: '1.2'
                          }}
                          title={holiday.localName}
                        >
                          {holiday.localName.length > 12 ? 
                            holiday.localName.substring(0, 12) + '...' : 
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

        {/* Holiday List */}
        {currentMonthHolidays.length > 0 && (
          <div style={{ 
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e9ecef'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#212529',
              marginBottom: '16px'
            }}>
              Public Holidays This Month
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {currentMonthHolidays.map((holiday, index) => (
                <div 
                  key={index}
                  className="legend-item"
                  style={{ 
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ 
                    fontWeight: '500',
                    color: '#212529',
                    marginBottom: '4px'
                  }}>
                    {format(new Date(holiday.date), 'MMM dd, yyyy')}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
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