import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const Reminder = () => {
  const [spentHours, setSpentHours] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchData = async () => {
      try {
        const tasksResponse = await axios.get(
          'http://localhost:5001/api/tasks/today',
          { headers },
        );
        setSpentHours(tasksResponse.data.spentHours || 0);

        const eventsResponse = await axios.get(
          'http://localhost:5001/api/events/today',
          { headers },
        );
        console.log('Fetched events:', eventsResponse.data);
        console.log('Full events response:', eventsResponse);
        console.log('Response status:', eventsResponse.status);
        console.log('Response headers:', eventsResponse.headers);
        console.log('Response data type:', typeof eventsResponse.data);
        console.log('Response data content:', eventsResponse.data);
        setEvents(
          Array.isArray(eventsResponse.data) ? eventsResponse.data : [],
        );
      } catch (error) {
        console.error('Error fetching data:', error);
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
            You're managing your time well!
          </div>
          <div className="flex flex-row justify-end">
            <img
              src="/tofu/front-tofu.png"
              className="w-14 h-14 object-cover"
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
            You're working hard! Remember to take a break!
          </div>
          <div className="flex flex-row justify-end">
            <img
              src="/tofu/happy.png"
              className="w-14 h-14 -translate-y-6 object-cover"
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
            You're overworking! Remember to rest well!
          </div>
          <div className="flex flex-row justify-end">
            <img
              src="/tofu/angry.png"
              className="w-14 h-14 -translate-y-6 object-cover"
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
          <div className="flex flex-wrap gap-10flex flex-row items-center justify-between px-14 mb-6 ">
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
