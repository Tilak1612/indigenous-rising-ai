import React from 'react';
import CourseCard from '@/components/CourseCard';

const COURSES = [
  { id: 'fundamentals', title: 'Fundamentals of Indigenous Business', progress: 20 },
  { id: 'digital-story', title: 'Digital Storytelling', progress: 75 },
  { id: 'leadership', title: 'Advanced Leadership', progress: 0 }
];

const MyLearning: React.FC = () => {
  return (
    <section className="bg-white/4 p-4 rounded-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Learning</h2>
        <p className="text-sm text-white/70">Track progress and enroll in new courses</p>
      </div>

      <div className="space-y-3">
        {COURSES.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  );
};

export default MyLearning;
