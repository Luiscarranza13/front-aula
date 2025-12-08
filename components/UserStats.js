'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/SimpleChart';
import { BookOpen, CheckCircle2, Clock, Award } from 'lucide-react';

export default function UserStats({ stats }) {
  const defaultStats = {
    coursesEnrolled: 0,
    tasksCompleted: 0,
    tasksPending: 0,
    averageGrade: 0,
    ...stats
  };

  const items = [
    { label: 'Cursos', value: defaultStats.coursesEnrolled, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Completadas', value: defaultStats.tasksCompleted, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pendientes', value: defaultStats.tasksPending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Promedio', value: defaultStats.averageGrade, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100', suffix: '/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <Card key={idx} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold">{item.value}{item.suffix || ''}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
