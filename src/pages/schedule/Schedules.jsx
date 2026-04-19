import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CategoryService } from '../../api/services.js';
import { CalendarBookingService } from '../../features/calendar/services/calendarBookingService.js';
import { CalendarTaskService } from '../../features/calendar/services/calendarTaskService.js';
import CalendarToolbar from '../../features/calendar/components/CalendarToolbar.jsx';
import MonthView from '../../features/calendar/components/MonthView.jsx';
import WeekView from '../../features/calendar/components/WeekView.jsx';
import DayView from '../../features/calendar/components/DayView.jsx';
import BookingModal from '../../features/calendar/components/BookingModal.jsx';
import BookingDetailsDrawer from '../../features/calendar/components/BookingDetailsDrawer.jsx';
import RescheduleModal from '../../features/calendar/components/RescheduleModal.jsx';
import CancelModal from '../../features/calendar/components/CancelModal.jsx';
import {
  generateTimeSlots,
} from '../../features/calendar/utils/slotGenerator.js';
import {
  formatLocalISO,
  formatMonthYear,
  formatFullDate,
  formatShortDate,
  startOfWeek,
  getWeekDays,
  addDays,
} from '../../features/calendar/utils/dateMath.js';

const slots = generateTimeSlots();

const Schedules = () => {
  const today = useMemo(() => new Date(), []);

  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(today);
  const [activeDay, setActiveDay] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [prefillDate, setPrefillDate] = useState(null);
  const [prefillTime, setPrefillTime] = useState(null);

  // Subscribe to bookings
  useEffect(() => {
    const unsub = CalendarBookingService.subscribe((data) => setBookings(data || []));
    return () => { if (unsub) unsub(); };
  }, []);

  // Load categories
  useEffect(() => {
    CategoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Derived data
  const filteredBookings = useMemo(() => {
    if (selectedCategory === 'All') return bookings;
    return bookings.filter((b) => (b.category || b.serviceCategory) === selectedCategory);
  }, [bookings, selectedCategory]);

  const weekDays = useMemo(() => getWeekDays(startOfWeek(currentDate)), [currentDate]);

  // Navigation label
  const toolbarLabel = useMemo(() => {
    if (view === 'month') return formatMonthYear(currentDate);
    if (view === 'week') {
      const ws = startOfWeek(currentDate);
      const we = addDays(ws, 6);
      return `${formatShortDate(ws)} – ${formatShortDate(we)}`;
    }
    return formatFullDate(activeDay instanceof Date ? activeDay : currentDate);
  }, [view, currentDate, activeDay]);

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      if (view === 'month') { nd.setMonth(nd.getMonth() - 1); return nd; }
      if (view === 'week') return addDays(nd, -7);
      return addDays(nd, -1);
    });
    if (view === 'day') setActiveDay((d) => addDays(d instanceof Date ? d : new Date(), -1));
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((d) => {
      const nd = new Date(d);
      if (view === 'month') { nd.setMonth(nd.getMonth() + 1); return nd; }
      if (view === 'week') return addDays(nd, 7);
      return addDays(nd, 1);
    });
    if (view === 'day') setActiveDay((d) => addDays(d instanceof Date ? d : new Date(), 1));
  }, [view]);

  const handleDayClick = useCallback((day) => {
    setActiveDay(day);
    setCurrentDate(day);
    setView('day');
  }, []);

  const handleSlotClick = useCallback((isoDate, time) => {
    setPrefillDate(isoDate);
    setPrefillTime(time);
    setEditingBooking(null);
    setBookingModalOpen(true);
  }, []);

  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setPrefillDate(null);
    setPrefillTime(null);
    setEditingBooking(null);
    setBookingModalOpen(true);
  }, []);

  const handleSaveBooking = useCallback(async (payload, id) => {
    if (id) {
      await CalendarBookingService.update(id, payload);
    } else {
      await CalendarBookingService.create(payload);
    }
  }, []);

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

  const handleEdit = useCallback((booking) => {
    setEditingBooking(booking);
    setPrefillDate(null);
    setPrefillTime(null);
    setDrawerOpen(false);
    setBookingModalOpen(true);
  }, []);

  const activeDayIso = activeDay instanceof Date ? formatLocalISO(activeDay) : String(activeDay || '');

  return (
    <div className="h-full min-h-0 bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        label={toolbarLabel}
        onPrev={handlePrev}
        onNext={handleNext}
        onAdd={handleAdd}
        selectedCategory={selectedCategory}
        categories={categories}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'month' && (
            <MonthView
              key="month"
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              bookings={filteredBookings}
              categories={categories}
              activeDay={activeDay}
              onDayClick={handleDayClick}
            />
          )}
          {view === 'week' && (
            <WeekView
              key="week"
              weekDays={weekDays}
              slots={slots}
              bookings={filteredBookings}
              categories={categories}
              activeDay={activeDayIso}
              onSlotClick={handleSlotClick}
              onBookingClick={handleBookingClick}
            />
          )}
          {view === 'day' && (
            <DayView
              key="day"
              date={activeDay instanceof Date ? activeDay : currentDate}
              slots={slots}
              bookings={filteredBookings}
              categories={categories}
              onSlotClick={handleSlotClick}
              onBookingClick={handleBookingClick}
            />
          )}
        </AnimatePresence>
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => { setBookingModalOpen(false); setEditingBooking(null); }}
        onSave={handleSaveBooking}
        prefillDate={prefillDate}
        prefillTime={prefillTime}
        editingBooking={editingBooking}
        bookings={bookings}
      />

      <BookingDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        booking={selectedBooking}
        onEdit={handleEdit}
        onReschedule={handleOpenReschedule}
        onCancel={handleOpenCancel}
        onMarkPendingEdit={handleMarkPendingEdit}
        onComplete={handleComplete}
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
