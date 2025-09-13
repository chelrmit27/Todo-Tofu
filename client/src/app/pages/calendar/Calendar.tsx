import React, {
  useCallback,
  useMemo,
  useRef,
} from 'react';
import FullCalendar from '@fullcalendar/react';
import type {
  DateSelectArg,
  EventClickArg,
  EventChangeArg,
  DatesSetArg,
} from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from '@/components/ui/Modal';
import { useEventsStore } from '@/stores';

const Calendar = () => {
  const calendarRef = useRef<FullCalendar>(null);
  
  // Get state and actions from Zustand store
  const {
    events,
    isLoading,
    error,
    isModalOpen,
    editEvent,
    newEvent,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    openModal,
    closeModal,
    setNewEvent,
    clearError,
  } = useEventsStore();

  // Utility function to format date as YYYY-MM-DD
  function toDateStringUTC(date: Date) {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  // Handle calendar view date changes
  const handleDatesSet = useCallback(
    async (arg: DatesSetArg) => {
      const startDate = new Date(arg.start); // FullCalendar start
      const endDate = new Date(arg.end); // FullCalendar end

      // Add one extra day to end date to ensure we fetch all events
      const endDatePlusOne = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

      const from = toDateStringUTC(startDate);
      const to = toDateStringUTC(endDatePlusOne);

      console.log('📅 Current view range:', from, 'to', to);
      console.log('📅 FullCalendar provided range:', toDateStringUTC(startDate), 'to', toDateStringUTC(endDate));
      await fetchEvents(from, to);
    },
    [fetchEvents],
  );

  // Handle calendar date selection
  const handleSelect = useCallback((selection: DateSelectArg) => {
    const toDatetimeLocal = (date: Date): string => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      const hh = pad(date.getHours());
      const mi = pad(date.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    // Set new event data and open modal
    setNewEvent({
      title: '',
      start: toDatetimeLocal(selection.start),
      end: toDatetimeLocal(selection.end ?? selection.start),
      allDay: selection.allDay,
    });
    openModal(); // Open in create mode
  }, [setNewEvent, openModal]);

  // Handle form submission
  const handleModalSubmit = async () => {
    const convertToUTC = (datetimeLocalStr: string): string => {
      const localDate = new Date(datetimeLocalStr);
      return localDate.toISOString();
    };

    const payload = {
      title: newEvent.title,
      start: convertToUTC(newEvent.start),
      end: convertToUTC(newEvent.end),
      allDay: newEvent.allDay,
    };

    console.log('📝 Submitting event:', payload);

    try {
      if (editEvent) {
        await updateEvent(editEvent._id, payload);
        console.log('✅ Event updated successfully');
      } else {
        await createEvent(payload);
        console.log('✅ Event created successfully');
        
        // Force refetch events from the database for the current view
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          const currentView = calendarApi.view;
          const startDate = new Date(currentView.activeStart);
          const endDate = new Date(currentView.activeEnd);
          
          // Add one extra day to end date to ensure we fetch all events
          const endDatePlusOne = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
          
          const from = startDate.toISOString().split('T')[0];
          const to = endDatePlusOne.toISOString().split('T')[0];
          
          console.log('🔄 Refetching events for date range:', from, 'to', to);
          await fetchEvents(from, to);
        }
      }
    } catch (error) {
      console.error('❌ Error submitting event:', error);
    }
  };

  // Handle event drag/resize
  const handleEventChange = useCallback(async (change: EventChangeArg) => {
    const ev = change.event;
    try {
      const payload = {
        start: ev.start?.toISOString(),
        end: ev.end?.toISOString(),
        allDay: ev.allDay,
      };
      const id = ev.extendedProps._id || ev.id;
      await updateEvent(id, payload);
    } catch (e) {
      console.error('Update (drag/resize) failed', e);
      change.revert();
    }
  }, [updateEvent]);

  // Handle event click
  const handleEventClick = useCallback(
    (click: EventClickArg) => {
      const id = click.event.extendedProps._id || click.event.id;
      const found = events.find((e) => e._id === id);
      if (found) {
        openModal(found); // Open in edit mode
      }
    },
    [events, openModal],
  );

  // Convert events for FullCalendar
  const fcEvents = useMemo(() => {
    console.log('🔍 Raw events from store:', events);
    
    if (!Array.isArray(events)) {
      console.log('⚠️ Events is not an array:', events);
      return [];
    }

    const converted = events.map((e) => ({
      id: e._id,
      title: e.title,
      start: new Date(e.start),
      end: new Date(e.end),
      allDay: e.allDay,
      extendedProps: { ...e },
      classNames:
        e.source === 'ics' ? ['border-l-4', 'border-l-indigo-500'] : [],
    }));

    console.log('✅ Converted events for FullCalendar:', converted);
    return converted;
  }, [events]);

  function formatDateTimeLocalInput(utcStr: string): string {
    const date = new Date(utcStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  return (
    <div className="flex h-full">
      <main className="flex-1 p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="rounded-xl bg-[hsl(var(--page-bg))]">
          <FullCalendar
            ref={calendarRef as React.RefObject<FullCalendar>}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            timeZone="local"
            initialView="timeGridWeek"
            nowIndicator={true}
            headerToolbar={{
              left: 'today prev,next',
              center: 'title',
              right: '',
            }}
            views={{
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long' },
              },
            }}
            height="calc(100vh - 6rem)"
            selectable
            editable
            selectMirror
            dayMaxEvents
            displayEventTime
            allDaySlot={false}
            events={fcEvents}
            select={handleSelect}
            eventChange={handleEventChange}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            loading={(isLoading) => console.log('Calendar loading:', isLoading)}
            eventContent={(eventInfo) => {
              return (
                <div>
                  <b>{eventInfo.timeText}</b> <br />
                  <i>{eventInfo.event.title}</i>
                </div>
              );
            }}
            dayHeaderContent={(args) => {
              const isToday =
                args.date.toDateString() === new Date().toDateString();
              if (isToday) {
                return (
                  <div className="text-center font-medium py-2">
                    <div className="text-sm text-primary">
                      {args.text.split(' ')[0].toUpperCase()}
                    </div>
                    <div className="text-2xl text-primary-foreground bg-primary py-2 px-3 rounded-full">
                      {args.text.split(' ')[1].split('/')[1]}
                    </div>
                  </div>
                );
              }
              return (
                <div className="text-center font-medium py-2">
                  <div className="text-sm">
                    {args.text.split(' ')[0].toUpperCase()}
                  </div>
                  <div className="text-3xl p-2">
                    {args.text.split(' ')[1].split('/')[1]}
                  </div>
                </div>
              );
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        </div>
      </main>
      
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleModalSubmit();
            }}
            className="p-4"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editEvent ? 'Edit Event' : 'New Event'}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ title: e.target.value })
                }
                required
                className="w-full p-2 border rounded input-black-text"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Start</label>
              <input
                type="datetime-local"
                value={formatDateTimeLocalInput(newEvent.start)}
                onChange={(e) =>
                  setNewEvent({ start: e.target.value })
                }
                required
                className="w-full p-2 border rounded input-black-text"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">End</label>
              <input
                type="datetime-local"
                value={formatDateTimeLocalInput(newEvent.end)}
                onChange={(e) =>
                  setNewEvent({ end: e.target.value })
                }
                required
                className="w-full p-2 border rounded input-black-text"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="mr-2 px-4 py-2 bg-muted rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="mr-2 px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                {editEvent ? 'Update Event' : 'Create Event'}
              </button>
              {editEvent && (
                <button
                  type="button"
                  onClick={async () => {
                    if (editEvent) {
                      await deleteEvent(editEvent._id);
                    }
                  }}
                  className="mr-2 px-4 py-2 bg-destructive text-destructive-foreground rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;