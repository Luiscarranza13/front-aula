'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BookOpen, ClipboardList, MessageSquare, CheckCircle2, Upload } from 'lucide-react';

const activityIcons = {
  course: BookOpen,
  task: ClipboardList,
  forum: MessageSquare,
  grade: CheckCircle2,
  upload: Upload,
  default: Activity,
};

const activityColors = {
  course: 'text-blue-500 bg-blue-100',
  task: 'text-orange-500 bg-orange-100',
  forum: 'text-purple-500 bg-purple-100',
  grade: 'text-green-500 bg-green-100',
  upload: 'text-indigo-500 bg-indigo-100',
  default: 'text-gray-500 bg-gray-100',
};

export default function RecentActivity({ activities = [] }) {
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} horas`;
    return `Hace ${days} días`;
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, idx) => {
          const Icon = activityIcons[activity.type] || activityIcons.default;
          const colorClass = activityColors[activity.type] || activityColors.default;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass.split(' ')[1]}`}>
                <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(activity.date)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
