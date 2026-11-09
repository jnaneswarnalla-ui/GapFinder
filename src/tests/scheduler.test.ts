import { describe, it, expect } from 'vitest';
import {
  generateDeterministicSchedule,
  calculatePlanDiff,
  TopicForSchedule,
} from '../lib/scoring/scheduler';

describe('Deterministic Revision Scheduler', () => {
  const mockTopics: TopicForSchedule[] = [
    {
      id: 't1',
      title: 'Photosynthesis Light Reaction',
      unitName: 'Life Processes',
      masteryScore: 30,
      priorityScore: 700,
      status: 'weak',
      examFrequency: 9,
    },
    {
      id: 't2',
      title: 'Chemical Reactions and Equations',
      unitName: 'Chemical Substances',
      masteryScore: 85,
      priorityScore: 120,
      status: 'strong',
      examFrequency: 7,
    },
    {
      id: 't3',
      title: 'Excretion in Nephrons',
      unitName: 'Life Processes',
      masteryScore: 55,
      priorityScore: 405,
      status: 'medium',
      examFrequency: 8,
    },
  ];

  it('allocates total minutes across days and prioritizes weakest topics first', () => {
    const daysAvailable = 3;
    const hoursPerDay = 2; // 120 mins/day -> total 360 mins
    const plan = generateDeterministicSchedule(mockTopics, daysAvailable, hoursPerDay);

    expect(plan.days.length).toBe(3);
    expect(plan.totalStudyMinutes).toBe(360);

    // Highest priority topic (t1) should receive the most study time
    const t1Allocation = plan.priorityRankedTopics.find(t => t.topicId === 't1')?.allocatedMinutes || 0;
    const t2Allocation = plan.priorityRankedTopics.find(t => t.topicId === 't2')?.allocatedMinutes || 0;

    expect(t1Allocation).toBeGreaterThan(t2Allocation);
  });

  it('generates task objects with correct types based on mastery level', () => {
    const plan = generateDeterministicSchedule(mockTopics, 2, 2);
    const allTasks = plan.days.flatMap(d => d.tasks);

    // Weak topic task should be deep_dive or concept_review
    const weakTask = allTasks.find(t => t.topicId === 't1');
    expect(['deep_dive', 'concept_review']).toContain(weakTask?.taskType);

    // Medium topic task should be practice_drill
    const mediumTask = allTasks.find(t => t.topicId === 't3');
    if (mediumTask) {
      expect(mediumTask.taskType).toBe('practice_drill');
    }
  });

  it('calculates plan updates diffs when student improves mastery on re-test', () => {
    const oldTopics = [
      { id: 't1', title: 'Photosynthesis', masteryScore: 35, status: 'weak' },
      { id: 't2', title: 'Nephrons', masteryScore: 50, status: 'medium' },
    ];

    const newTopics = [
      { id: 't1', title: 'Photosynthesis', masteryScore: 82, status: 'strong' },
      { id: 't2', title: 'Nephrons', masteryScore: 68, status: 'medium' },
    ];

    const diffs = calculatePlanDiff(oldTopics, newTopics);
    expect(diffs.length).toBe(2);

    const t1Diff = diffs.find(d => d.topicId === 't1');
    expect(t1Diff?.masteryDelta).toBe(47);
    expect(t1Diff?.oldStatus).toBe('weak');
    expect(t1Diff?.newStatus).toBe('strong');
    expect(t1Diff?.actionTaken).toContain('Promoted to Strong');
  });
});
