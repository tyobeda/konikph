'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { AGENDA_EVENTS, AgendaEvent } from '@/lib/agendaData';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const CATEGORY_COLORS: Record<string, { dot: string; badge: string }> = {
  Kejuaraan: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50',
  },
  Pelatihan: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
  },
  Seleksi: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
  },
  Organisasi: {
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50',
  },
};

export function KoniCalendarSection() {
  // Current view month & year (initialized to current date / October 2026)
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(() => {
    // Default to 2026 for simulated data context, or actual year if >= 2026
    const yr = today.getFullYear();
    return yr >= 2026 ? yr : 2026;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    // October is month index 9 (0-indexed)
    return today.getMonth() === 9 && today.getFullYear() >= 2026 ? 9 : 9;
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
    setSelectedDate(null);
    setCurrentSlideIndex(0);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
    setSelectedDate(null);
    setCurrentSlideIndex(0);
  };

  const handleResetToToday = () => {
    const yr = today.getFullYear() >= 2026 ? today.getFullYear() : 2026;
    setCurrentYear(yr);
    setCurrentMonth(9); // Oktober 2026
    setSelectedDate(null);
    setSelectedCategory('Semua');
    setCurrentSlideIndex(0);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Convert getDay() (0: Sunday .. 6: Saturday) to Monday-based (0: Monday .. 6: Sunday)
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: true, dateStr });
    }

    // Next month padding days to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index events by dates (including multi-day events)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    AGENDA_EVENTS.forEach((item) => {
      const start = new Date(item.startDate);
      const end = item.endDate ? new Date(item.endDate) : start;

      const cur = new Date(start);
      while (cur <= end) {
        const dateStr = cur.toISOString().split('T')[0];
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)!.push(item);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, []);

  // Filtered events to display in the right list
  const displayedEvents = useMemo(() => {
    let list = [...AGENDA_EVENTS];

    // Category filter
    if (selectedCategory !== 'Semua') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    // Specific date selection
    if (selectedDate) {
      list = list.filter((item) => {
        const start = item.startDate;
        const end = item.endDate || item.startDate;
        return selectedDate >= start && selectedDate <= end;
      });
    } else {
      // Prioritize events in current month or upcoming
      const curMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const inCurrentMonth = list.filter(
        (i) => i.startDate.startsWith(curMonthPrefix) || (i.endDate && i.endDate >= curMonthPrefix)
      );
      if (inCurrentMonth.length > 0) {
        list = inCurrentMonth;
      }
    }

    // Sort by start date ascending
    list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return list;
  }, [selectedDate, selectedCategory, currentYear, currentMonth]);

  const todayStr = useMemo(() => {
    const yr = today.getFullYear() >= 2026 ? today.getFullYear() : 2026;
    return `${yr}-10-22`;
  }, [today]);

  const safeSlideIndex = displayedEvents.length > 0
    ? Math.min(currentSlideIndex, displayedEvents.length - 1)
    : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next slide
        setCurrentSlideIndex((prev) => (prev < displayedEvents.length - 1 ? prev + 1 : 0));
      } else {
        // swipe right -> prev slide
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : displayedEvents.length - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <section className="mb-14 scroll-mt-24" id="kalender-agenda">
      {/* ── Section Card Container with Glassmorphism ── */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Kalender Kegiatan Olahraga Daerah
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/agenda"
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-950/40 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-transparent hover:border-red-200 dark:hover:border-red-800"
            >
              <span>Lihat Halaman Agenda</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Main Layout: Calendar Matrix (Left) + Event Timeline (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 relative z-10 items-start">
          
          {/* ── Left Column: Interactive Calendar (lg:col-span-5) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gray-50/70 dark:bg-gray-900/50 rounded-2xl p-4 sm:p-5 border border-gray-200/60 dark:border-gray-800 shadow-xs">
              
              {/* Month & Year Navigation Bar */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-200/60 dark:border-gray-800">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleResetToToday}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer mr-1"
                    title="Kembali ke bulan aktif"
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                    aria-label="Bulan Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                    aria-label="Bulan Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day Labels Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAY_LABELS.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-[11px] font-bold py-1 ${
                      idx >= 5 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Matrix Cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, idx) => {
                  const eventsOnThisDay = eventsByDate.get(cell.dateStr) || [];
                  const hasEvents = eventsOnThisDay.length > 0;
                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDate(null);
                        } else {
                          setSelectedDate(cell.dateStr);
                        }
                        setCurrentSlideIndex(0);
                      }}
                      className={`relative h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-xs font-bold ${
                        !cell.isCurrentMonth
                          ? 'text-gray-300 dark:text-gray-700 opacity-40 hover:opacity-75'
                          : isSelected
                          ? 'bg-red-600 text-white shadow-md shadow-red-500/30 scale-105 z-10'
                          : isToday
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-black ring-2 ring-red-500'
                          : hasEvents
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-gray-700 shadow-2xs'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>{cell.day}</span>

                      {/* Event Dot Indicators */}
                      {hasEvents && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {eventsOnThisDay.slice(0, 3).map((ev, eIdx) => {
                            const dotColor = isSelected
                              ? 'bg-white'
                              : CATEGORY_COLORS[ev.category]?.dot || 'bg-red-500';
                            return (
                              <span
                                key={eIdx}
                                className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Color Legend Bar */}
              <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-800 flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Kejuaraan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Seleksi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Pelatihan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Organisasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Event Cards Slider (lg:col-span-7) ── */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filter Category Tabs + Reset Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {['Semua', 'Kejuaraan', 'Seleksi', 'Pelatihan', 'Organisasi'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentSlideIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    setCurrentSlideIndex(0);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Tampilkan Semua Hari</span>
                </button>
              )}
            </div>

            {/* Active Date Banner if selected */}
            {selectedDate && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={14} />
                  <span>
                    Agenda untuk tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </span>
                </span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {displayedEvents.length} Kegiatan
                </span>
              </div>
            )}

            {/* Event Cards Slider */}
            {displayedEvents.length === 0 ? (
              <div className="py-12 text-center bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                  <CalendarIcon size={20} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Tidak ada agenda olahraga pada filter ini
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Silakan pilih tanggal lain pada kalender atau klik tombol "Hari Ini" untuk melihat agenda yang tersedia.
                </p>
                <button
                  type="button"
                  onClick={handleResetToToday}
                  className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter Kalender</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Single-card Viewport with Touch Swiping */}
                <div
                  className="overflow-hidden rounded-2xl"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${safeSlideIndex * 100}%)` }}
                  >
                    {displayedEvents.map((item) => {
                      const sDate = new Date(item.startDate);
                      const dayNum = sDate.getDate();
                      const monthShort = MONTH_NAMES[sDate.getMonth()]?.slice(0, 3).toUpperCase();

                      return (
                        <div key={item.id} className="w-full shrink-0">
                          <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-red-500/40 transition-all flex flex-col justify-between gap-4 min-h-[190px]">
                            {/* Card Content: Left Date Box, Right Details */}
                            <div className="flex items-start gap-3.5 sm:gap-4">
                              {/* Left Date Pill: Day black, Month red */}
                              <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xs shrink-0">
                                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                  {dayNum}
                                </span>
                                <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                                  {monthShort}
                                </span>
                              </div>

                              {/* Title, Time, Location, Organizer */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug line-clamp-2">
                                  {item.title}
                                </h4>

                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <Clock size={13} className="text-slate-400 shrink-0" />
                                    <span>{item.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin size={13} className="text-slate-400 shrink-0" />
                                    <span>{item.location}</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
                                  Oleh: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{item.organizer}</strong>
                                </p>
                              </div>
                            </div>

                            {/* Bottom: Detail Button on Right */}
                            <div className="flex items-center justify-end pt-1">
                              <Link
                                href="/agenda"
                                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                              >
                                <span>Detail</span>
                                <ChevronRight size={13} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slider Indicator Navigation (Matching user's red sketch) */}
                {displayedEvents.length > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : displayedEvents.length - 1))}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      aria-label="Slide sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {displayedEvents.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            idx === safeSlideIndex
                              ? 'w-7 h-2 bg-red-600 shadow-xs'
                              : 'w-2.5 h-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-400'
                          }`}
                          aria-label={`Ke agenda ke-${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev < displayedEvents.length - 1 ? prev + 1 : 0))}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                      aria-label="Slide berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export default KoniCalendarSection;
