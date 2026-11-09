/**
 * GapFinder AI: Deterministic Mastery Engine
 * 
 * Computes deterministic mastery score per topic across quiz attempts.
 * 
 * Formula:
 * M(t) = [ sum_i (w_diff(i) * w_recency(i) * S_i) / sum_i (w_diff(i) * w_recency(i)) ] * C(n)
 * 
 * Where:
 * - S_i in {0, 0.5, 1.0} (score for incorrect, partial, correct)
 * - w_diff(i): Easy = 1.0, Medium = 1.3, Hard = 1.7
 * - w_recency(i): Exponential decay based on attempt order/time (lambda = 0.25)
 * - C(n) = min(1.0, n / MIN_QUESTIONS_CONFIDENCE) (Confidence factor for sample size, default min 3 questions)
 * 
 * Mastery Levels:
 * - < 50% => Weak (Red)
 * - 50% - 79% => Medium (Yellow)
 * - >= 80% => Strong (Green)
 * 
 * Priority Score:
 * Priority(t) = (100 - M(t)) * (exam_frequency + 1)
 */

export type MasteryStatus = 'weak' | 'medium' | 'strong';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionAttemptRecord {
  questionId: string;
  topicId: string;
  difficulty: QuestionDifficulty;
  score: number; // 0, 0.5, or 1
  attemptIndex: number; // 1 = oldest, N = newest
  attemptDate?: Date | string;
}

export interface TopicMasteryResult {
  topicId: string;
  masteryScore: number; // 0 to 100
  status: MasteryStatus;
  priorityScore: number;
  confidence: number; // 0 to 1
  attemptsCount: number;
  accuracy: number; // unweighted percentage
}

export const DIFFICULTY_WEIGHTS: Record<QuestionDifficulty, number> = {
  easy: 1.0,
  medium: 1.3,
  hard: 1.7,
};

export const MIN_QUESTIONS_FOR_FULL_CONFIDENCE = 3;
export const RECENCY_LAMBDA = 0.25;

export function getDifficultyWeight(difficulty?: string): number {
  const norm = (difficulty || 'medium').toLowerCase() as QuestionDifficulty;
  return DIFFICULTY_WEIGHTS[norm] || 1.3;
}

export function getRecencyWeight(attemptIndex: number, totalAttempts: number): number {
  // If only 1 attempt or no index, weight is 1.0
  if (totalAttempts <= 1) return 1.0;
  // Recent attempts get highest weight (1.0), older ones decay exponentially
  const age = Math.max(0, totalAttempts - attemptIndex);
  return Math.exp(-RECENCY_LAMBDA * age);
}

export function getMasteryStatus(score: number): MasteryStatus {
  if (score < 50) return 'weak';
  if (score < 80) return 'medium';
  return 'strong';
}

export function computeTopicMastery(
  topicId: string,
  records: QuestionAttemptRecord[],
  examFrequency: number = 1
): TopicMasteryResult {
  if (!records || records.length === 0) {
    return {
      topicId,
      masteryScore: 0,
      status: 'weak',
      priorityScore: 100 * (examFrequency + 1),
      confidence: 0,
      attemptsCount: 0,
      accuracy: 0,
    };
  }

  const n = records.length;
  let weightedSum = 0;
  let totalWeight = 0;
  let rawScoreSum = 0;

  // Sort by attemptIndex ascending
  const sorted = [...records].sort((a, b) => a.attemptIndex - b.attemptIndex);
  const maxAttempt = sorted[sorted.length - 1].attemptIndex;

  for (const rec of sorted) {
    const diffWeight = getDifficultyWeight(rec.difficulty);
    const recencyWeight = getRecencyWeight(rec.attemptIndex, maxAttempt);
    const weight = diffWeight * recencyWeight;

    // Clamp score between 0 and 1
    const clampedScore = Math.max(0, Math.min(1, rec.score));
    weightedSum += weight * clampedScore;
    totalWeight += weight;
    rawScoreSum += clampedScore;
  }

  // Confidence discount when under the minimum question count
  const confidence = Math.min(1.0, n / MIN_QUESTIONS_FOR_FULL_CONFIDENCE);
  const baseRatio = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Calculate scaled 0-100 score
  const masteryScore = Math.round(baseRatio * 100 * confidence * 10) / 10;
  const status = getMasteryStatus(masteryScore);

  // Priority formula: weakness * (exam_frequency + 1)
  const priorityScore = Math.round((100 - masteryScore) * (examFrequency + 1) * 10) / 10;
  const accuracy = Math.round((rawScoreSum / n) * 100);

  return {
    topicId,
    masteryScore,
    status,
    priorityScore,
    confidence,
    attemptsCount: n,
    accuracy,
  };
}
