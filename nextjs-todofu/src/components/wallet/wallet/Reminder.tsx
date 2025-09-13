'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Event {
  title: string;
  start: string;
  end: string;
}

interface ApiError {
  response?: {
    data: unknown;
    status: number;
  };
}

const Reminder = () => {
  const [spentHours, setSpentHours] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);

  console.log('Reminder component rendered');
  console.log('Current state - spentHours:', spentHours, 'events:', events);

  useEffect(() => {
    console.log('useEffect triggered - fetching data');
    const fetchData = async () => {
      try {
        const currentDate = new Date();
        // Use local date instead of UTC to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const todayDateString = `${year}-${month}-${day}`;
        
        console.log('🔔 REMINDER COMPONENT: Current timestamp:', Date.now());
        console.log('🔔 REMINDER COMPONENT: Loading data for LOCAL date:', todayDateString);
        console.log('🔔 REMINDER COMPONENT: Current date object:', currentDate);
        console.log('🔔 REMINDER COMPONENT: Local year/month/day:', year, month, day);
        console.log('🔔 REMINDER COMPONENT: ISO string full:', currentDate.toISOString());
        console.log('🔔 REMINDER COMPONENT: Timezone offset:', currentDate.getTimezoneOffset());
        console.log('🔔 REMINDER COMPONENT: Will call API: /tasks?date=' + todayDateString);
        
        console.log('Making API call to /tasks/today');
        const tasksResponse = await api.get('/tasks/today');
        console.log('Tasks response:', tasksResponse);
        console.log('Tasks response data:', tasksResponse.data);
        console.log('Setting spentHours to:', tasksResponse.data.spentHours || 0);
        setSpentHours(tasksResponse.data.spentHours || 0);

        console.log('Making API call to /tasks?date=' + todayDateString);
        const eventsResponse = await api.get(`/tasks?date=${todayDateString}&_t=${Date.now()}`);
        console.log('🔔 REMINDER: Full API URL called:', `/tasks?date=${todayDateString}&_t=${Date.now()}`);
        console.log('Events response:', eventsResponse);
        console.log('Events response data:', eventsResponse.data);
        
        // Extract events from the tasks API response
        const eventsData = eventsResponse.data?.events || [];
        console.log('Events data type:', typeof eventsData);
        console.log('Is events data array?', Array.isArray(eventsData));
        console.log('Setting events to:', eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as ApiError;
          console.error('Error details:', apiError.response?.data);
          console.error('Error status:', apiError.response?.status);
        }
      }
    };

    fetchData();
  }, []);

  const renderReminderBlock = () => {
    if (spentHours < 5) {
      return (
        <div className="flex flex-col bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl py-5 px-5 w-72 h-40">
          <div className="bg-[hsl(var(--tofu-tag-bg))] w-fit px-2 rounded-s rounded-e text-[hsl(var(--tofu-tag-text))]">
            Tofu
          </div>
          <div className="py-3 text-foreground">
            You&apos;re managing your time well!
          </div>
          <div className="flex flex-row justify-end">
            <Image
              src="/tofu/front-tofu.png"
              alt="Happy Tofu"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
        </div>
      );
    } else if (spentHours < 8) {
      return (
        <div className="flex flex-col bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl py-5 px-5 w-72 h-40">
          <div className="bg-[hsl(var(--tofu-tag-bg))] w-fit px-2 rounded-s rounded-e text-[hsl(var(--tofu-tag-text))]">
            Tofu
          </div>
          <div className="py-3 text-foreground">
            You&apos;re working hard! Remember to take a break!
          </div>
          <div className="flex flex-row justify-end">
            <Image
              src="/tofu/happy.jpeg"
              alt="Happy Tofu"
              width={56}
              height={56}
              className="-translate-y-6 object-cover"
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl py-5 px-5 w-72 h-40">
          <div className="bg-[hsl(var(--tofu-tag-bg))] w-fit px-2 rounded-s rounded-e text-[hsl(var(--tofu-tag-text))]">
            Tofu
          </div>
          <div className="py-3 text-foreground">
            You&apos;re overworking! Remember to rest well!
          </div>
          <div className="flex flex-row justify-end">
            <Image
              src="/tofu/angry.jpeg"
              alt="Angry Tofu"
              width={56}
              height={56}
              className="-translate-y-6 object-cover"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Reminders</h2>
      <div className="px-0">
        {/* Show carousel only if there are more than 3 total items */}
        {events.length + 1 > 3 ? (
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {/* Reminder Card */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <div className="flex aspect-square items-center justify-center ">
                    {renderReminderBlock()}
                  </div>
                </div>
              </CarouselItem>

              {/* Event Cards */}
              {events.map((event, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <div className="flex aspect-square items-center justify-center ">
                      <div className="flex flex-col bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl py-5 px-5 w-72 h-40">
                        <div className="bg-[hsl(var(--category-tag-bg))] w-fit px-2 rounded-s rounded-e text-[hsl(var(--category-tag-text))]">
                          calendar
                        </div>
                        <div className="py-3 text-foreground">
                          {event.title}
                        </div>
                        <div className="flex flex-row justify-between border-t border-[hsl(var(--wallet-border))] pt-3">
                          <div className="text-foreground">Due At:</div>
                          <div className="text-foreground">
                            {new Date(event.end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Nav Buttons */}
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          /* Show simple grid layout for 3 or fewer items */
          <div className="flex flex-wrap gap-10 flex-row items-center justify-start px-14 mb-6">
            {/* Reminder Card */}
            <div className="p-1">
              <div className="flex aspect-square items-center justify-center">
                {renderReminderBlock()}
              </div>
            </div>

            {/* Event Cards */}
            {events.map((event, index) => (
              <div key={index} className="p-1">
                <div className="flex aspect-square items-center justify-center">
                  <div className="flex flex-col bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-2xl py-5 px-5 w-72 h-40">
                    <div className="bg-[hsl(var(--category-tag-bg))] w-fit px-2 rounded-s rounded-e text-[hsl(var(--category-tag-text))]">
                      calendar
                    </div>
                    <div className="py-3 text-foreground">{event.title}</div>
                    <div className="flex flex-row justify-between border-t border-[hsl(var(--wallet-border))] pt-3">
                      <div className="text-foreground">Due At:</div>
                      <div className="text-foreground">
                        {new Date(event.end).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminder;
