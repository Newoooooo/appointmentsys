import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, LayoutDashboard, LayoutList, Plus } from 'lucide-react';
import clsx from 'clsx';
import DailyListView from './DailyListView.jsx';
import WeeklyGridView from './WeeklyGridView.jsx';
import MonthView from './MonthView.jsx';
import FilterDropdown from '../../components/dropdowns/FilterDropdown.jsx';
import AddBookingModal from '../../components/modals/AddBookingModal.jsx';
import BookingDetailsDrawer from '../../features/calendar/components/BookingDetailsDrawer.jsx';
import RescheduleModal from '../../features/calendar/components/RescheduleModal.jsx';
import CancelModal from '../../features/calendar/components/CancelModal.jsx';
import { BookingService, CategoryService, ServiceService } from '../../api/services.js';
import { CalendarBookingService } from '../../features/calendar/services/calendarBookingService.js';
import { CalendarTaskService } from '../../features/calendar/services/calendarTaskService.js';

const formatLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseISODate = (isoDate) => {
    if (!isoDate || typeof isoDate !== 'string') return null;
    const parts = isoDate.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const [year, month, day] = parts;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStartOfWeekMonday = (inputDate) => {
    const date = new Date(inputDate);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const mondayOffset = (day + 6) % 7;
    date.setDate(date.getDate() - mondayOffset);
    return date;
};

const addDays = (inputDate, days) => {
    const next = new Date(inputDate);
    next.setDate(next.getDate() + days);
    return next;
};

const resolveBookingDate = (dateValue, fallbackDay) => {
    if (typeof dateValue?.toDate === 'function') {
        const date = dateValue.toDate();
        if (date instanceof Date && !Number.isNaN(date.getTime())) {
            return formatLocalISODate(date);
        }
    }

    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return formatLocalISODate(dateValue);
    }

    if (typeof dateValue === 'string') {
        const isoParsed = parseISODate(dateValue);
        if (isoParsed) return formatLocalISODate(isoParsed);

        const nativeParsed = new Date(dateValue);
        if (!Number.isNaN(nativeParsed.getTime())) {
            return formatLocalISODate(nativeParsed);
        }
    }

    if (typeof dateValue === 'number') {
        const nativeParsed = new Date(dateValue);
        if (!Number.isNaN(nativeParsed.getTime())) {
            return formatLocalISODate(nativeParsed);
        }
    }

    const fallback = new Date();
    const parsedDay = Number.parseInt(String(fallbackDay ?? ''), 10);
    if (!Number.isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        fallback.setDate(parsedDay);
    }

    return formatLocalISODate(fallback);
};

const getWeekMonthLabel = (week) => {
    if (!week || week.length === 0) return '';

    const firstDate = parseISODate(week[0].fullDate);
    const lastDate = parseISODate(week[week.length - 1].fullDate);

    if (!firstDate || !lastDate) return '';

    const firstMonth = firstDate.toLocaleDateString('en-US', { month: 'long' });
    const lastMonth = lastDate.toLocaleDateString('en-US', { month: 'long' });
    const firstYear = firstDate.getFullYear();
    const lastYear = lastDate.getFullYear();

    if (firstMonth === lastMonth && firstYear === lastYear) {
        return `${firstMonth} ${firstYear}`;
    }

    if (firstYear === lastYear) {
        return `${firstMonth} - ${lastMonth} ${firstYear}`;
    }

    return `${firstMonth} ${firstYear} - ${lastMonth} ${lastYear}`;
};

const Schedules = () => {
    const today = useMemo(() => new Date(), []);
    const todayIso = useMemo(() => formatLocalISODate(today), [today]);

    const [view, setView] = useState('day');
    const [activeDay, setActiveDay] = useState(todayIso);
    const [rawBookings, setRawBookings] = useState([]);
    const [serviceCategoryMap, setServiceCategoryMap] = useState({});
    const [categoryColorMap, setCategoryColorMap] = useState({});
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingPrefillContext, setBookingPrefillContext] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeekMonday(today));

    useEffect(() => {
        const unsubscribe = BookingService.subscribeToBookings((bookings) => {
            setRawBookings(bookings || []);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    useEffect(() => {
        ServiceService.getServices()
            .then((services) => {
                const map = {};
                (services || []).forEach((service) => {
                    if (!service?.id) return;
                    map[service.id] = service.category || 'Uncategorized';
                });
                setServiceCategoryMap(map);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        CategoryService.getCategories()
            .then((cats) => {
                const map = {};
                (cats || []).forEach((cat) => {
                    if (cat?.name) map[cat.name] = cat.color || '#F26389';
                });
                setCategoryColorMap(map);
            })
            .catch(console.error);
    }, []);

    const normalizedRange = useMemo(() => {
        const start = parseISODate(rangeStart);
        const end = parseISODate(rangeEnd);

        if (start && end && start > end) {
            return { start: end, end: start };
        }

        return { start, end };
    }, [rangeStart, rangeEnd]);

    const minWeekStart = useMemo(() => {
        if (!normalizedRange.start) return null;
        return getStartOfWeekMonday(normalizedRange.start);
    }, [normalizedRange.start]);

    const maxWeekStart = useMemo(() => {
        if (!normalizedRange.end) return null;
        return getStartOfWeekMonday(normalizedRange.end);
    }, [normalizedRange.end]);

    useEffect(() => {
        if (minWeekStart && currentWeekStart < minWeekStart) {
            setCurrentWeekStart(minWeekStart);
            return;
        }

        if (maxWeekStart && currentWeekStart > maxWeekStart) {
            setCurrentWeekStart(maxWeekStart);
        }
    }, [currentWeekStart, maxWeekStart, minWeekStart]);

    const fullWeek = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const dayDate = addDays(currentWeekStart, index);
            return {
                label: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
                dateNumber: String(dayDate.getDate()),
                monthShort: dayDate.toLocaleDateString('en-US', { month: 'short' }),
                fullDate: formatLocalISODate(dayDate)
            };
        });
    }, [currentWeekStart]);

    useEffect(() => {
        if (fullWeek.some((day) => day.fullDate === activeDay)) return;
        setActiveDay(fullWeek[0]?.fullDate || todayIso);
    }, [activeDay, fullWeek, todayIso]);

    const appointments = useMemo(() => {
        return (rawBookings || []).map((booking) => {
            const fullDate = resolveBookingDate(booking.date, booking.day);
            const category = serviceCategoryMap[booking.serviceId] || booking.category || 'Uncategorized';
            const startTime = booking.startTime || booking.time || '10:00';
            const endTime = booking.endTime || booking.time || '11:00';

            return {
                id: booking.id,
                time: startTime,
                startTime,
                endTime,
                durationMinutes: booking.durationMinutes,
                name: booking.clientName || booking.name,
                room: booking.serviceTitle || booking.room,
                day: fullDate,
                fullDate,
                category,
                type: booking.type || 'normal',
                staff: booking.staffName || booking.staff,
                date: booking.date,
                totalPrice: booking.totalPrice,
                clientContact: booking.clientContact,
                selectedAddons: booking.selectedAddons,
                // Include all booking data for viewing/editing
                ...booking
            };
        });
    }, [rawBookings, serviceCategoryMap]);

    const categoryOptions = useMemo(() => {
        const categorySet = new Set();

        Object.values(serviceCategoryMap).forEach((category) => {
            if (category) categorySet.add(category);
        });

        appointments.forEach((appointment) => {
            if (appointment.category) categorySet.add(appointment.category);
        });

        return ['All', ...Array.from(categorySet).sort((a, b) => a.localeCompare(b))];
    }, [appointments, serviceCategoryMap]);

    const filteredAppointments = useMemo(() => {
        return appointments.filter((appointment) => {
            const inCategory = selectedCategory === 'All' || appointment.category === selectedCategory;
            const inStartRange = !normalizedRange.start || appointment.fullDate >= formatLocalISODate(normalizedRange.start);
            const inEndRange = !normalizedRange.end || appointment.fullDate <= formatLocalISODate(normalizedRange.end);
            return inCategory && inStartRange && inEndRange;
        });
    }, [appointments, normalizedRange.end, normalizedRange.start, selectedCategory]);

    const canGoPrev = useMemo(() => {
        if (!minWeekStart) return true;
        return currentWeekStart > minWeekStart;
    }, [currentWeekStart, minWeekStart]);

    const canGoNext = useMemo(() => {
        if (!maxWeekStart) return true;
        return currentWeekStart < maxWeekStart;
    }, [currentWeekStart, maxWeekStart]);

    const monthLabel = useMemo(() => getWeekMonthLabel(fullWeek), [fullWeek]);

    const getCategoryColor = (categoryName) => {
        return categoryColorMap[categoryName] || '#F26389';
    };

    const hours = Array.from({ length: 29 }, (_, index) => {
        const totalMinutes = (7 * 60) + (index * 30);
        const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const minute = String(totalMinutes % 60).padStart(2, '0');
        return `${hour}:${minute}`;
    });

    const handlePrevWeek = () => {
        if (!canGoPrev) return;
        setCurrentWeekStart((prev) => addDays(prev, -7));
        const parsedActiveDay = parseISODate(activeDay);
        if (parsedActiveDay) {
            setActiveDay(formatLocalISODate(addDays(parsedActiveDay, -7)));
        }
    };

    const handleNextWeek = () => {
        if (!canGoNext) return;
        setCurrentWeekStart((prev) => addDays(prev, 7));
        const parsedActiveDay = parseISODate(activeDay);
        if (parsedActiveDay) {
            setActiveDay(formatLocalISODate(addDays(parsedActiveDay, 7)));
        }
    };

    const handleOpenBookingModal = () => {
        setBookingPrefillContext(null);
        setBookingModalOpen(true);
    };

    const handleSlotClick = (fullDate, hour) => {
        const parsedDate = parseISODate(fullDate);
        if (!parsedDate) {
            handleOpenBookingModal();
            return;
        }

        const [hourValue = '09', minuteValue = '00'] = String(hour || '09:00').split(':');

        setBookingPrefillContext({
            month: String(parsedDate.getMonth() + 1).padStart(2, '0'),
            day: String(parsedDate.getDate()).padStart(2, '0'),
            year: String(parsedDate.getFullYear()),
            hour: String(hourValue).padStart(2, '0'),
            minute: String(minuteValue).padStart(2, '0')
        });
        setBookingModalOpen(true);
    };

    const handleDateRangeStartChange = (event) => {
        setRangeStart(event.target.value);
    };

    const handleDateRangeEndChange = (event) => {
        setRangeEnd(event.target.value);
    };

    const handleModalClose = () => {
        setBookingModalOpen(false);
        setBookingPrefillContext(null);
        setEditingBooking(null);
    };

    const handleAppointmentClick = (appointment) => {
        setSelectedBooking(appointment);
        setDrawerOpen(true);
    };

    const handleEditBooking = (booking) => {
        setEditingBooking(booking);
        setDrawerOpen(false);
        setBookingModalOpen(true);
    };

    const handleBookingDeleted = () => {
        // Bookings will automatically update via the subscription
    };

    const handleMarkPendingEdit = useCallback(async (booking) => {
        await CalendarBookingService.markPendingEdit(booking.id);
        await CalendarTaskService.createPendingEditTask(booking);
        setDrawerOpen(false);
    }, []);

    const handleComplete = useCallback(async (booking) => {
        await CalendarBookingService.complete(booking.id);
        setDrawerOpen(false);
    }, []);

    const handleOpenReschedule = useCallback((booking) => {
        setSelectedBooking(booking);
        setRescheduleModalOpen(true);
    }, []);

    const handleReschedule = useCallback(async (data) => {
        if (!selectedBooking) return;
        await CalendarBookingService.reschedule(selectedBooking.id, data);
        setRescheduleModalOpen(false);
        setDrawerOpen(false);
    }, [selectedBooking]);

    const handleOpenCancel = useCallback((booking) => {
        setSelectedBooking(booking);
        setCancelModalOpen(true);
    }, []);

    const handleCancel = useCallback(async (reason) => {
        if (!selectedBooking) return;
        await CalendarBookingService.cancel(selectedBooking.id, reason);
        setCancelModalOpen(false);
        setDrawerOpen(false);
    }, [selectedBooking]);

    return (
        <div className="h-full min-h-0 bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-visible">
            <header className="flex flex-col gap-4 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 relative z-30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrevWeek}
                            disabled={!canGoPrev}
                            className="h-9 w-9 rounded-xl border border-[#e6e4e6] dark:border-white/10 text-[#767676] dark:text-[#a0a0a0] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#F26389] hover:text-[#F26389] transition-all flex items-center justify-center"
                            aria-label="Previous week"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNextWeek}
                            disabled={!canGoNext}
                            className="h-9 w-9 rounded-xl border border-[#e6e4e6] dark:border-white/10 text-[#767676] dark:text-[#a0a0a0] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#F26389] hover:text-[#F26389] transition-all flex items-center justify-center"
                            aria-label="Next week"
                        >
                            <ChevronRight size={14} />
                        </button>

                        <div className="ml-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#767676] dark:text-[#a0a0a0]">{view === 'month' ? 'Month View' : 'Week View'}</p>
                            <p className="text-sm font-black tracking-tight text-[#2f3035] dark:text-white">{monthLabel}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-[#f4f2f4] dark:bg-[#111] p-1 rounded-xl border border-[#f4f2f4] dark:border-white/10 shrink-0">
                            <button
                                onClick={() => setView('day')}
                                className={clsx('p-1.5 rounded-lg transition-all', view === 'day' ? 'bg-white dark:bg-white/10 shadow-sm text-[#F26389]' : 'text-[#767676] dark:text-[#a0a0a0]')}
                                title="Day view"
                            >
                                <LayoutList size={14} />
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={clsx('p-1.5 rounded-lg transition-all', view === 'week' ? 'bg-white dark:bg-white/10 shadow-sm text-[#F26389]' : 'text-[#767676] dark:text-[#a0a0a0]')}
                                title="Week view"
                            >
                                <LayoutDashboard size={14} />
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={clsx('p-1.5 rounded-lg transition-all', view === 'month' ? 'bg-white dark:bg-white/10 shadow-sm text-[#F26389]' : 'text-[#767676] dark:text-[#a0a0a0]')}
                                title="Month view"
                            >
                                <Calendar size={14} />
                            </button>
                        </div>

                        <div className="relative z-50">
                            <FilterDropdown
                                activeFilter={selectedCategory}
                                onSelect={setSelectedCategory}
                                align="right"
                                options={categoryOptions}
                            />
                        </div>

                        <button
                            onClick={handleOpenBookingModal}
                            className="h-9 w-9 bg-[#F26389] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#F26389]/20 shrink-0"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#767676] dark:text-[#a0a0a0]">Date Range</label>
                    <input
                        type="date"
                        value={rangeStart}
                        onChange={handleDateRangeStartChange}
                        className="h-9 px-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                    />
                    <span className="text-[#767676] dark:text-[#a0a0a0] text-xs font-black">to</span>
                    <input
                        type="date"
                        value={rangeEnd}
                        onChange={handleDateRangeEndChange}
                        className="h-9 px-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                    />
                    {(rangeStart || rangeEnd) && (
                        <button
                            type="button"
                            onClick={() => {
                                setRangeStart('');
                                setRangeEnd('');
                            }}
                            className="h-9 px-3 rounded-xl border border-[#e6e4e6] dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-[#767676] dark:text-[#a0a0a0] hover:text-[#F26389] hover:border-[#F26389] transition-all"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {view === 'day' ? (
                        <DailyListView
                            key="day"
                            activeDay={activeDay}
                            setActiveDay={setActiveDay}
                            fullWeek={fullWeek}
                            hours={hours}
                            appointments={filteredAppointments}
                            getCategoryColor={getCategoryColor}
                            onSlotClick={handleSlotClick}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    ) : view === 'week' ? (
                        <WeeklyGridView
                            key="week"
                            activeDay={activeDay}
                            fullWeek={fullWeek}
                            hours={hours}
                            appointments={filteredAppointments}
                            getCategoryColor={getCategoryColor}
                            onSlotClick={handleSlotClick}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    ) : (
                        <MonthView
                            key="month"
                            activeDay={activeDay}
                            onSelectDay={(day) => {
                                setActiveDay(day);
                                setView('day');
                            }}
                            appointments={filteredAppointments}
                            currentWeekStart={currentWeekStart}
                            onPrevMonth={() => setCurrentWeekStart((prev) => {
                                const d = new Date(prev);
                                d.setMonth(d.getMonth() - 1);
                                d.setDate(1);
                                return d;
                            })}
                            onNextMonth={() => setCurrentWeekStart((prev) => {
                                const d = new Date(prev);
                                d.setMonth(d.getMonth() + 1);
                                d.setDate(1);
                                return d;
                            })}
                            getCategoryColor={getCategoryColor}
                            todayIso={todayIso}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AddBookingModal
                isOpen={bookingModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalClose}
                prefillContext={bookingPrefillContext}
                editingBooking={editingBooking}
            />

            <BookingDetailsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                booking={selectedBooking}
                onEdit={handleEditBooking}
                onReschedule={handleOpenReschedule}
                onCancel={handleOpenCancel}
                onMarkPendingEdit={handleMarkPendingEdit}
                onComplete={handleComplete}
                onBookingUpdated={(updated) => setSelectedBooking(updated)}
            />

            <RescheduleModal
                isOpen={rescheduleModalOpen}
                onClose={() => setRescheduleModalOpen(false)}
                onReschedule={handleReschedule}
                booking={selectedBooking}
            />

            <CancelModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onCancel={handleCancel}
                booking={selectedBooking}
            />
        </div>
    );
};

export default Schedules;
