import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../lib/api';

// Types
export interface ApiEvent {
  _id: string;
  title: string;
  start: string; // ISO UTC
  end: string; // ISO UTC
  allDay?: boolean;
  location?: string;
  notes?: string;
  source?: 'manual' | 'ics';
}

interface EventsState {
  events: ApiEvent[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  
  // Modal state
  isModalOpen: boolean;
  editEvent: ApiEvent | null;
  newEvent: {
    title: string;
    start: string;
    end: string;
    allDay: boolean;
  };
  
  // Actions
  fetchEvents: (fromISO: string, toISO: string) => Promise<void>;
  createEvent: (eventData: Omit<ApiEvent, '_id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<ApiEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Modal actions
  openModal: (event?: ApiEvent) => void;
  closeModal: () => void;
  setNewEvent: (event: Partial<EventsState['newEvent']>) => void;
  clearError: () => void;
}

const useEventsStore = create<EventsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      events: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      
      // Modal state
      isModalOpen: false,
      editEvent: null,
      newEvent: {
        title: '',
        start: '',
        end: '',
        allDay: false,
      },

      // Actions
      fetchEvents: async (fromISO: string, toISO: string) => {
        const state = get();
        if (state.isLoading) return;

        set({ isLoading: true, error: null }, false, 'events/fetchStart');

        try {
          console.log('Fetching events from UTC range:', fromISO, 'to:', toISO);

          const { data } = await api.get('/events', {
            params: { from: fromISO, to: toISO },
          });

          const adjustedEvents = data.map((event: ApiEvent) => ({
            ...event,
            start: event.start, // Keep as ISO UTC
            end: event.end, // Keep as ISO UTC
          }));

          console.log('Adjusted events:', adjustedEvents);

          set(
            {
              events: adjustedEvents,
              isLoading: false,
              lastFetched: new Date(),
              error: null,
            },
            false,
            'events/fetchSuccess'
          );
        } catch (error) {
          console.error('Failed loading events', error);
          set(
            {
              error: 'Failed to load events',
              isLoading: false,
            },
            false,
            'events/fetchError'
          );
        }
      },

      createEvent: async (eventData) => {
        try {
          console.log('📤 Creating event on server:', eventData);
          const { data } = await api.post<ApiEvent>('/events', eventData);
          console.log('📥 Received event from server:', data);
          
          // Just close the modal - don't add to local state
          // The calendar will refetch events from the database
          set(
            {
              isModalOpen: false,
              editEvent: null,
              newEvent: { title: '', start: '', end: '', allDay: false },
            },
            false,
            'events/createSuccess'
          );
          
          console.log('✅ Event created, modal closed');
        } catch (error) {
          console.error('Failed to create event', error);
          set({ error: 'Failed to create event' }, false, 'events/createError');
        }
      },

      updateEvent: async (id, eventData) => {
        try {
          const { data } = await api.patch<ApiEvent>(`/events/${id}`, eventData);
          set(
            (state) => ({
              events: state.events.map((e) => (e._id === data._id ? data : e)),
              isModalOpen: false,
              editEvent: null,
            }),
            false,
            'events/updateSuccess'
          );
        } catch (error) {
          console.error('Failed to update event', error);
          set({ error: 'Failed to update event' }, false, 'events/updateError');
        }
      },

      deleteEvent: async (id) => {
        try {
          await api.delete(`/events/${id}`);
          set(
            (state) => ({
              events: state.events.filter((e) => e._id !== id),
              isModalOpen: false,
              editEvent: null,
            }),
            false,
            'events/deleteSuccess'
          );
        } catch (error) {
          console.error('Failed to delete event', error);
          set({ error: 'Failed to delete event' }, false, 'events/deleteError');
        }
      },

      // Modal actions
      openModal: (event) => {
        if (event) {
          // Edit mode
          const toDatetimeLocal = (utcStr: string): string => {
            const date = new Date(utcStr);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const yyyy = date.getFullYear();
            const mm = pad(date.getMonth() + 1);
            const dd = pad(date.getDate());
            const hh = pad(date.getHours());
            const mi = pad(date.getMinutes());
            return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
          };

          set(
            {
              isModalOpen: true,
              editEvent: event,
              newEvent: {
                title: event.title || '',
                start: toDatetimeLocal(event.start),
                end: toDatetimeLocal(event.end),
                allDay: event.allDay || false,
              },
            },
            false,
            'events/openEditModal'
          );
        } else {
          // Create mode - don't reset newEvent, keep existing values
          set(
            {
              isModalOpen: true,
              editEvent: null,
            },
            false,
            'events/openCreateModal'
          );
        }
      },

      closeModal: () => {
        set(
          {
            isModalOpen: false,
            editEvent: null,
            newEvent: { title: '', start: '', end: '', allDay: false },
          },
          false,
          'events/closeModal'
        );
      },

      setNewEvent: (eventUpdate) => {
        set(
          (state) => ({
            newEvent: { ...state.newEvent, ...eventUpdate },
          }),
          false,
          'events/setNewEvent'
        );
      },

      clearError: () => {
        set({ error: null }, false, 'events/clearError');
      },
    }),
    {
      name: 'events-store',
    }
  )
);

export default useEventsStore;
