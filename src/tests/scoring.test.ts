import { describe, it, expect } from 'vitest';
import {
  computeTopicMastery,
  getMasteryStatus,
  getDifficultyWeight,
  getRecencyWeight,
  QuestionAttemptRecord,
} from '../lib/scoring/mastery';

describe('Deterministic Mastery Engine', () => {
  it('correctly classifies status based on thresholds (<50 weak, 50-79 medium, >=80 strong)', () => {
    expect(getMasteryStatus(0)).toBe('weak');
    expect(getMasteryStatus(49.9)).toBe('weak');
    expect(getMasteryStatus(50)).toBe('medium');
    expect(getMasteryStatus(79.9)).toBe('medium');
    expect(getMasteryStatus(80)).toBe('strong');
    expect(getMasteryStatus(100)).toBe('strong');
  });

  it('weights difficulties appropriately (hard > medium > easy)', () => {
    const easyW = getDifficultyWeight('easy');
    const medW = getDifficultyWeight('medium');
    const hardW = getDifficultyWeight('hard');

    expect(easyW).toBe(1.0);
    expect(medW).toBe(1.3);
    expect(hardW).toBe(1.7);
    expect(hardW).toBeGreaterThan(medW);
    expect(medW).toBeGreaterThan(easyW);
  });

  it('weights recency higher for newest attempts than older attempts', () => {
    const totalAttempts = 5;
    const oldWeight = getRecencyWeight(1, totalAttempts);
    const midWeight = getRecencyWeight(3, totalAttempts);
    const newWeight = getRecencyWeight(5, totalAttempts);

    expect(newWeight).toBe(1.0);
    expect(newWeight).toBeGreaterThan(midWeight);
    expect(midWeight).toBeGreaterThan(oldWeight);
  });

  it('applies confidence factor discount when sample size is fewer than 3 questions', () => {
    // Single correct question: confidence = 1/3 ~ 0.33, mastery score discounted
    const singleCorrect: QuestionAttemptRecord[] = [
      { questionId: 'q1', topicId: 'top1', difficulty: 'medium', score: 1, attemptIndex: 1 },
    ];
    const resultSingle = computeTopicMastery('top1', singleCorrect, 2);
    expect(resultSingle.confidence).toBeCloseTo(0.33, 1);
    expect(resultSingle.masteryScore).toBeLessThan(50); // Discounted despite 100% accuracy

    // Three correct questions: full confidence = 1.0
    const threeCorrect: QuestionAttemptRecord[] = [
      { questionId: 'q1', topicId: 'top1', difficulty: 'medium', score: 1, attemptIndex: 1 },
      { questionId: 'q2', topicId: 'top1', difficulty: 'medium', score: 1, attemptIndex: 2 },
      { questionId: 'q3', topicId: 'top1', difficulty: 'medium', score: 1, attemptIndex: 3 },
    ];
    const resultThree = computeTopicMastery('top1', threeCorrect, 2);
    expect(resultThree.confidence).toBe(1.0);
    expect(resultThree.masteryScore).toBe(100);
    expect(resultThree.status).toBe('strong');
  });

  it('computes priority score prioritizing high weakness and high exam frequency', () => {
    const weakRecords: QuestionAttemptRecord[] = [
      { questionId: 'q1', topicId: 't_weak', difficulty: 'hard', score: 0, attemptIndex: 1 },
      { questionId: 'q2', topicId: 't_weak', difficulty: 'medium', score: 0.5, attemptIndex: 2 },
      { questionId: 'q3', topicId: 't_weak', difficulty: 'hard', score: 0, attemptIndex: 3 },
    ];
    // High exam frequency = 8
    const weakHighFreq = computeTopicMastery('t_weak', weakRecords, 8);

    const strongRecords: QuestionAttemptRecord[] = [
      { questionId: 'q1', topicId: 't_strong', difficulty: 'hard', score: 1, attemptIndex: 1 },
      { questionId: 'q2', topicId: 't_strong', difficulty: 'hard', score: 1, attemptIndex: 2 },
      { questionId: 'q3', topicId: 't_strong', difficulty: 'medium', score: 1, attemptIndex: 3 },
    ];
    // Low exam frequency = 2
    const strongLowFreq = computeTopicMastery('t_strong', strongRecords, 2);

    expect(weakHighFreq.priorityScore).toBeGreaterThan(strongLowFreq.priorityScore);
    expect(weakHighFreq.status).toBe('weak');
    expect(strongLowFreq.status).toBe('strong');
  });
});
