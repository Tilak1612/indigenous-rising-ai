import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight } from 'lucide-react';

interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  type: 'virtual' | 'in-person';
  location: string;
  spots: number;
  spotsLeft: number;
  instructor: string;
}

const trainingEvents: TrainingEvent[] = [
  {
    id: '1',
    title: 'Business Planning Fundamentals',
    description: 'Learn the essentials of creating a comprehensive business plan.',
    date: '2024-01-25',
    time: '10:00 AM EST',
    duration: '2 hours',
    type: 'virtual',
    location: 'Zoom',
    spots: 30,
    spotsLeft: 12,
    instructor: 'Sarah Whitehorse',
  },
  {
    id: '2',
    title: 'Grant Writing Workshop',
    description: 'Master the art of writing compelling grant proposals.',
    date: '2024-01-28',
    time: '1:00 PM EST',
    duration: '3 hours',
    type: 'virtual',
    location: 'Microsoft Teams',
    spots: 25,
    spotsLeft: 8,
    instructor: 'Michael Bearfoot',
  },
  {
    id: '3',
    title: 'OCAP™ Principles Training',
    description: 'In-depth training on Indigenous data sovereignty principles.',
    date: '2024-02-01',
    time: '9:00 AM EST',
    duration: '4 hours',
    type: 'in-person',
    location: 'Toronto, ON',
    spots: 20,
    spotsLeft: 5,
    instructor: 'Lisa Crow',
  },
  {
    id: '4',
    title: 'Digital Marketing for Indigenous Businesses',
    description: 'Learn effective digital marketing strategies.',
    date: '2024-02-05',
    time: '2:00 PM EST',
    duration: '2 hours',
    type: 'virtual',
    location: 'Zoom',
    spots: 40,
    spotsLeft: 25,
    instructor: 'Jennifer Raven',
  },
  {
    id: '5',
    title: 'Financial Management Essentials',
    description: 'Master financial planning and management for your business.',
    date: '2024-02-10',
    time: '11:00 AM EST',
    duration: '3 hours',
    type: 'virtual',
    location: 'Zoom',
    spots: 35,
    spotsLeft: 20,
    instructor: 'David Moose',
  },
];

export default function TrainingCalendar() {
  const [currentMonth, setCurrentMonth] = useState('January 2024');

  const upcomingEvents = trainingEvents.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Training Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage on-site and virtual training programs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainingEvents.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainingEvents.filter(e => e.type === 'virtual').length}</p>
                <p className="text-sm text-muted-foreground">Virtual</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainingEvents.filter(e => e.type === 'in-person').length}</p>
                <p className="text-sm text-muted-foreground">In-Person</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{currentMonth}</span>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple calendar grid placeholder */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-muted ${
                      [25, 28].includes(day) ? 'bg-primary/10 text-primary font-medium' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={event.type === 'virtual' ? 'secondary' : 'outline'}>
                      {event.type === 'virtual' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      {event.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{event.spotsLeft} spots left</span>
                  </div>
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {event.date}
                    <Clock className="h-3 w-3 ml-2" />
                    {event.time}
                  </div>
                  <Button size="sm" className="w-full">Register</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* All Events */}
        <Card>
          <CardHeader>
            <CardTitle>All Training Programs</CardTitle>
            <CardDescription>
              Browse and register for available training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {event.type === 'virtual' ? (
                        <Video className="h-6 w-6 text-primary" />
                      ) : (
                        <MapPin className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time} ({event.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.spotsLeft}/{event.spots} spots
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{event.location}</Badge>
                    <Button>Register</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
