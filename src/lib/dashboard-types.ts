export interface DashboardProgress {
  xpTotal: number;
  streakCount: number;
  progressPercent: number;
  medalsEarned: number;
  incomeTotal: number;
  lessonsCompleted: number;
  totalLessons: number;
  medals: { code: string; label: string; earned: boolean }[];
  weeklyActivity: { date: string; count: number }[];
  recentLessons: { id: string; title: string; completedAt: string }[];
}
export interface LearningAssignment {
  id: string;
  title: string;
  instructions: string;
  dueDate: string | null;
  assignedBy: string;
  createdAt: string;
}
