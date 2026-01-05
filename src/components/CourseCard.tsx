import React from 'react';

const CourseCard: React.FC<{ course: { id: string; title: string; progress: number } }> = ({ course }) => {
  return (
    <div className="bg-white/6 p-4 rounded-md flex items-center justify-between">
      <div>
        <p className="font-medium">{course.title}</p>
        <p className="text-sm text-white/70 mt-1">Progress: {course.progress}%</p>
      </div>

      <div className="w-40">
        <div className="bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="h-2 bg-emerald-500" style={{ width: `${course.progress}%` }} />
        </div>

        <div className="mt-3 flex items-center gap-2 justify-end">
          <button
            className="px-3 py-1 bg-emerald-500 rounded-md text-white text-sm"
            onClick={() => {
              try { import('@/lib/analytics').then((m) => m.trackEvent('training_continue', { courseId: course.id })); } catch {}
            }}
          >
            Continue
          </button>
          <button className="px-3 py-1 bg-white/6 rounded-md text-white/90 text-sm">Details</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
