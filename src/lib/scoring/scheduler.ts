/**
 * GapFinder AI: Deterministic Revision Scheduler
 * 
 * Allocates study time across available days using priority scores (weakest + high exam frequency).
 * Groups study into concrete daily schedules with time allocations, citations, and practice tasks.
 */

export interface TopicForSchedule {
  id: string;
  title: string;
  unitName: string;
  masteryScore: number;
  priorityScore: number;
  status: 'weak' | 'medium' | 'strong';
  examFrequency: number;
  citationHints?: string[];
}

export interface ScheduledTask {
  id: string;
  topicId: string;
  topicTitle: string;
  unitName: string;
  taskType: 'concept_review' | 'deep_dive' | 'practice_drill' | 'rapid_recall';
  allocatedMinutes: number;
  description: string;
  sourceSection?: string;
  practiceTarget?: string;
  completed: boolean;
}

export interface DaySchedule {
  dayNumber: number;
  dateStr: string;
  totalMinutes: number;
  focusUnit: string;
  tasks: ScheduledTask[];
}

export interface RevisionPlanResult {
  daysAvailable: number;
  hoursPerDay: number;
  totalStudyMinutes: number;
  allocatedMinutes: number;
  days: DaySchedule[];
  priorityRankedTopics: {
    topicId: string;
    title: string;
    priorityScore: number;
    allocatedMinutes: number;
  }[];
}

export function generateDeterministicSchedule(
  topics: TopicForSchedule[],
  daysAvailable: number,
  hoursPerDay: number,
  startDate: Date = new Date()
): RevisionPlanResult {
  const safeDays = Math.max(1, Math.min(60, daysAvailable));
  const safeHours = Math.max(0.5, Math.min(12, hoursPerDay));
  const dailyMinutes = Math.round(safeHours * 60);
  const totalStudyMinutes = safeDays * dailyMinutes;

  if (topics.length === 0) {
    return {
      daysAvailable: safeDays,
      hoursPerDay: safeHours,
      totalStudyMinutes,
      allocatedMinutes: 0,
      days: [],
      priorityRankedTopics: [],
    };
  }

  // Sort topics by priority descending (weakest + highest exam weight first)
  const sortedTopics = [...topics].sort((a, b) => b.priorityScore - a.priorityScore);
  const totalPriority = sortedTopics.reduce((sum, t) => sum + Math.max(1, t.priorityScore), 0);

  // Allocate total minutes proportionately, giving more weight to weak topics
  const topicAllocations = new Map<string, number>();
  let remainingMinutes = totalStudyMinutes;

  for (let i = 0; i < sortedTopics.length; i++) {
    const t = sortedTopics[i];
    const weight = Math.max(1, t.priorityScore) / totalPriority;
    // Minimum 20 mins if priority > 0
    let mins = Math.max(20, Math.round(totalStudyMinutes * weight));
    // Cap at remaining minutes
    mins = Math.min(remainingMinutes, mins);
    topicAllocations.set(t.id, mins);
    remainingMinutes -= mins;
    if (remainingMinutes <= 0) break;
  }

  // Distribute remaining minutes to top topics if any left
  if (remainingMinutes > 0 && sortedTopics.length > 0) {
    const topTopic = sortedTopics[0].id;
    topicAllocations.set(topTopic, (topicAllocations.get(topTopic) || 0) + remainingMinutes);
  }

  // Group into days
  const days: DaySchedule[] = [];
  let topicIndex = 0;
  let topicMinutesRemaining = topicAllocations.get(sortedTopics[0]?.id) || 0;

  for (let day = 1; day <= safeDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + (day - 1));
    const dateStr = currentDate.toISOString().split('T')[0];

    let dayBudget = dailyMinutes;
    const tasks: ScheduledTask[] = [];
    const unitTracker = new Map<string, number>();

    while (dayBudget >= 15 && topicIndex < sortedTopics.length) {
      const topic = sortedTopics[topicIndex];
      const taskDuration = Math.min(dayBudget, topicMinutesRemaining > 0 ? topicMinutesRemaining : 30);

      if (taskDuration < 15) {
        topicIndex++;
        if (topicIndex < sortedTopics.length) {
          topicMinutesRemaining = topicAllocations.get(sortedTopics[topicIndex].id) || 30;
        }
        continue;
      }

      // Determine task type based on mastery
      let taskType: ScheduledTask['taskType'] = 'concept_review';
      let description = `Review core mechanisms and solve diagnostic questions for ${topic.title}`;
      if (topic.status === 'weak') {
        taskType = taskDuration > 45 ? 'deep_dive' : 'concept_review';
        description = `Target foundational gaps in ${topic.title}: revise definitions, step-by-step notes, and core equations.`;
      } else if (topic.status === 'medium') {
        taskType = 'practice_drill';
        description = `Practice exam-style past questions on ${topic.title} to bridge partial knowledge to mastery.`;
      } else {
        taskType = 'rapid_recall';
        description = `Quick active recall and speed test on key concepts for ${topic.title}.`;
      }

      tasks.push({
        id: `task_${day}_${topic.id}_${tasks.length + 1}`,
        topicId: topic.id,
        topicTitle: topic.title,
        unitName: topic.unitName,
        taskType,
        allocatedMinutes: taskDuration,
        description,
        sourceSection: topic.citationHints?.[0] || `Section: ${topic.title}`,
        practiceTarget: `${Math.max(3, Math.round(taskDuration / 10))} practice questions`,
        completed: false,
      });

      unitTracker.set(topic.unitName, (unitTracker.get(topic.unitName) || 0) + taskDuration);
      dayBudget -= taskDuration;
      topicMinutesRemaining -= taskDuration;

      if (topicMinutesRemaining <= 0) {
        topicIndex++;
        if (topicIndex < sortedTopics.length) {
          topicMinutesRemaining = topicAllocations.get(sortedTopics[topicIndex].id) || 30;
        }
      }
    }

    // Determine focus unit of the day
    let focusUnit = 'General Revision';
    let maxUnitMins = 0;
    for (const [unit, mins] of unitTracker.entries()) {
      if (mins > maxUnitMins) {
        maxUnitMins = mins;
        focusUnit = unit;
      }
    }

    days.push({
      dayNumber: day,
      dateStr,
      totalMinutes: dailyMinutes - dayBudget,
      focusUnit,
      tasks,
    });
  }

  const priorityRankedTopics = sortedTopics.map(t => ({
    topicId: t.id,
    title: t.title,
    priorityScore: t.priorityScore,
    allocatedMinutes: topicAllocations.get(t.id) || 0,
  }));

  const allocatedMinutes = priorityRankedTopics.reduce((s, t) => s + t.allocatedMinutes, 0);

  return {
    daysAvailable: safeDays,
    hoursPerDay: safeHours,
    totalStudyMinutes,
    allocatedMinutes,
    days,
    priorityRankedTopics,
  };
}

export interface PlanUpdateDiff {
  topicId: string;
  topicTitle: string;
  oldStatus: string;
  newStatus: string;
  oldMastery: number;
  newMastery: number;
  masteryDelta: number;
  actionTaken: string;
}

export function calculatePlanDiff(
  oldTopics: { id: string; title: string; masteryScore: number; status: string }[],
  newTopics: { id: string; title: string; masteryScore: number; status: string }[]
): PlanUpdateDiff[] {
  const diffs: PlanUpdateDiff[] = [];
  const oldMap = new Map(oldTopics.map(t => [t.id, t]));

  for (const n of newTopics) {
    const old = oldMap.get(n.id);
    if (!old) continue;

    const delta = Math.round((n.masteryScore - old.masteryScore) * 10) / 10;
    if (Math.abs(delta) >= 1 || old.status !== n.status) {
      let action = 'Maintained current focus';
      if (delta > 0 && n.status === 'strong' && old.status !== 'strong') {
        action = `Promoted to Strong (${delta > 0 ? '+' : ''}${delta}%). Shifted revision time to remaining weak topics.`;
      } else if (delta > 0) {
        action = `Improved by +${delta}%. Reduced fundamental review time in favor of practice drills.`;
      } else if (delta < 0) {
        action = `Dropped by ${delta}%. Re-scheduled high-priority conceptual review sessions.`;
      }

      diffs.push({
        topicId: n.id,
        topicTitle: n.title,
        oldStatus: old.status,
        newStatus: n.status,
        oldMastery: old.masteryScore,
        newMastery: n.masteryScore,
        masteryDelta: delta,
        actionTaken: action,
      });
    }
  }

  return diffs;
}
