import { NextResponse } from 'next/server';

export async function GET() {
  // Demo class cohort insight data
  const classStats = {
    className: 'Grade 10 - Section A (Science Cohort 2026)',
    totalStudents: 34,
    classAverageMastery: 64.2,
    strugglingStudentsCount: 9,
    onTrackStudentsCount: 25,
    topStruggleTopics: [
      {
        topic: 'Photosynthesis & Photolysis of Water',
        unit: 'Life Processes',
        failureRate: 68,
        commonMisconception: 'Conflating thylakoid light reactions with stroma dark reactions',
        avgScore: 38,
        difficulty: 'hard',
      },
      {
        topic: 'Excretion: Nephron Ultrafiltration & Reabsorption',
        unit: 'Life Processes',
        failureRate: 59,
        commonMisconception: 'Assuming all substances in filtrate are excreted without 100% glucose reabsorption',
        avgScore: 44,
        difficulty: 'hard',
      },
      {
        topic: 'Thermal Decomposition of Ferrous Sulphate',
        unit: 'Chemical Substances',
        failureRate: 47,
        commonMisconception: 'Forgetting sulfur dioxide (SO2) and sulfur trioxide (SO3) gas evolution',
        avgScore: 54,
        difficulty: 'medium',
      },
      {
        topic: 'Double Circulation in Human Heart',
        unit: 'Life Processes',
        failureRate: 38,
        commonMisconception: 'Reversing pulmonary artery and pulmonary vein oxygenation status',
        avgScore: 65,
        difficulty: 'medium',
      },
      {
        topic: 'Balancing Redox & Corrosion Equations',
        unit: 'Chemical Substances',
        failureRate: 26,
        commonMisconception: 'Confusing oxidizing agent with the reduced substance',
        avgScore: 78,
        difficulty: 'easy',
      },
    ],
    distribution: [
      { gradeRange: '<50% (Weak)', count: 9, percentage: 26.5 },
      { gradeRange: '50-79% (Medium)', count: 18, percentage: 52.9 },
      { gradeRange: '>=80% (Strong)', count: 7, percentage: 20.6 },
    ],
  };

  return NextResponse.json(classStats);
}
