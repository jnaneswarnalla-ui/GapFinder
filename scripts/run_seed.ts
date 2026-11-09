import pg from 'pg';
import bcrypt from 'bcryptjs';
import {
  SAMPLE_USER,
  SAMPLE_SYLLABUS,
  SAMPLE_NOTES_CHAPTER_1,
  SAMPLE_NOTES_CHAPTER_2,
  SAMPLE_NOTES_CHAPTER_3,
  SAMPLE_PAST_PAPER,
  SAMPLE_TOPICS,
  SAMPLE_PRESEEDED_ATTEMPTS,
} from '../src/lib/seed/sample-data.js';
import { chunkDocument } from '../src/lib/rag/chunker.js';
import { computeTopicMastery } from '../src/lib/scoring/mastery.js';
import { generateDeterministicSchedule } from '../src/lib/scoring/scheduler.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Seeding demo data to Neon...');
    await client.query('BEGIN');

    const targetUserId = SAMPLE_USER.id;
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(SAMPLE_USER.password, salt);

    await client.query(
      `INSERT INTO users (id, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3, name = $4`,
      [SAMPLE_USER.id, SAMPLE_USER.email, hashedPass, SAMPLE_USER.name, SAMPLE_USER.role]
    );

    // Clean previous
    await client.query('DELETE FROM revision_plans WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM topic_mastery WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM quiz_attempts WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM quizzes WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM past_paper_questions WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM topics WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM chunks WHERE user_id = $1', [targetUserId]);
    await client.query('DELETE FROM materials WHERE user_id = $1', [targetUserId]);

    const materials = [
      { id: `mat_syl_${targetUserId}`, ...SAMPLE_SYLLABUS },
      { id: `mat_ch1_${targetUserId}`, ...SAMPLE_NOTES_CHAPTER_1 },
      { id: `mat_ch2_${targetUserId}`, ...SAMPLE_NOTES_CHAPTER_2 },
      { id: `mat_ch3_${targetUserId}`, ...SAMPLE_NOTES_CHAPTER_3 },
      { id: `mat_pp_${targetUserId}`, ...SAMPLE_PAST_PAPER },
    ];

    for (const mat of materials) {
      await client.query(
        `INSERT INTO materials (id, user_id, title, file_type, raw_text, file_size, chunk_count)
         VALUES ($1, $2, $3, $4, $5, $6, 0)`,
        [mat.id, targetUserId, mat.title, mat.fileType, mat.content, mat.content.length]
      );

      const chunks = chunkDocument(mat.id, mat.title, mat.fileType, mat.content, undefined, { maxChunkSize: 600, overlapSize: 100 });
      for (const ch of chunks) {
        await client.query(
          `INSERT INTO chunks (id, material_id, user_id, content, chapter, section, page_number, heading)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            ch.id,
            mat.id,
            targetUserId,
            ch.content,
            ch.metadata.chapter || null,
            ch.metadata.section || null,
            ch.metadata.pageNumber || 1,
            ch.metadata.heading || null,
          ]
        );
      }
      await client.query(`UPDATE materials SET chunk_count = $1 WHERE id = $2`, [chunks.length, mat.id]);
    }

    const topicIdMap = new Map();
    const topicsForScheduler = [];
    for (const t of SAMPLE_TOPICS) {
      const dbTopicId = `top_${targetUserId}_${t.id}`;
      topicIdMap.set(t.id, dbTopicId);
      await client.query(
        `INSERT INTO topics (id, user_id, unit_name, title, description, exam_frequency, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [dbTopicId, targetUserId, t.unitName, t.title, t.description, t.examFrequency, t.orderIndex]
      );
    }

    // Past paper questions
    const ppq = [
      { text: 'Explain the light reaction of photosynthesis and photolysis.', topicRef: 'top_photo_nutrition', year: '2024', marks: 3 },
      { text: 'Why is double circulation necessary in human beings?', topicRef: 'top_circulation_heart', year: '2024', marks: 2 },
      { text: 'Describe the structure of a nephron and ultrafiltration.', topicRef: 'top_excretion_nephron', year: '2023', marks: 5 },
      { text: 'Differentiate between aerobic and anaerobic respiration.', topicRef: 'top_respiration_atp', year: '2023', marks: 3 },
      { text: 'Thermal decomposition of ferrous sulphate crystals.', topicRef: 'top_chem_rxn', year: '2022', marks: 3 },
      { text: 'Role of HCl and mucus in stomach digestion.', topicRef: 'top_human_digestion', year: '2022', marks: 2 },
      { text: 'Iron nail displacement in copper sulphate solution.', topicRef: 'top_chem_rxn', year: '2023', marks: 2 },
      { text: 'Define rancidity and corrosion prevention techniques.', topicRef: 'top_chem_rxn', year: '2024', marks: 3 },
      { text: 'Guard cell regulation of stomatal opening.', topicRef: 'top_photo_nutrition', year: '2022', marks: 3 },
    ];

    for (let i = 0; i < ppq.length; i++) {
      const q = ppq[i];
      await client.query(
        `INSERT INTO past_paper_questions (id, user_id, question_text, year, marks, linked_topic_id, citation_snippet)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`ppq_${targetUserId}_${i + 1}`, targetUserId, q.text, q.year, q.marks, topicIdMap.get(q.topicRef) || null, `Past Paper ${q.year}`]
      );
    }

    // Quiz & Attempts
    const quizId = `quiz_diag_${targetUserId}`;
    await client.query(
      `INSERT INTO quizzes (id, user_id, title, topic_ids, questions)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        quizId,
        targetUserId,
        'Class 10 Science Comprehensive Diagnostic Quiz',
        JSON.stringify(Array.from(topicIdMap.values())),
        JSON.stringify([
          {
            id: 'q1',
            topicId: topicIdMap.get('top_photo_nutrition'),
            type: 'mcq',
            question: 'During photosynthesis, where does the photolysis of water occur?',
            options: [
              'Inside the thylakoid membrane / grana',
              'In the stroma matrix',
              'In the outer chloroplast membrane',
              'Inside the cytoplasm',
            ],
            correctOptionIndex: 0,
            difficulty: 'medium',
            citation: {
              source: 'Chapter 2: Life Processes',
              section: '2.1 Essential Photochemical Steps',
              page: 1,
              snippet: 'Water molecules are cleaved into protons, electrons, and molecular oxygen (Photolysis: 2H2O -> 4H+ + 4e- + O2). This reaction takes place exclusively during the light phase inside thylakoid grana.',
            },
          },
          {
            id: 'q2',
            topicId: topicIdMap.get('top_excretion_nephron'),
            type: 'mcq',
            question: 'Which substance present in glomerular filtrate is normally 100% selectively reabsorbed in the proximal convoluted tubule?',
            options: [
              'Urea and uric acid',
              'Glucose and amino acids',
              'Excess potassium ions',
              'Bile salts',
            ],
            correctOptionIndex: 1,
            difficulty: 'hard',
            citation: {
              source: 'Chapter 3: Respiration, Circulation & Excretion',
              section: '3.3 Selective Tubular Reabsorption',
              page: 2,
              snippet: 'In the Proximal Convoluted Tubule (PCT) and Loop of Henle, essential nutrients (100% of glucose and amino acids, plus 85% of water and salts) are selectively pumped back into surrounding peritubular capillaries.',
            },
          },
          {
            id: 'q3',
            topicId: topicIdMap.get('top_chem_rxn'),
            type: 'mcq',
            question: 'What type of chemical reaction is the thermal heating of ferrous sulphate crystals?',
            options: [
              'Combination reaction',
              'Thermal decomposition reaction',
              'Displacement reaction',
              'Neutralization reaction',
            ],
            correctOptionIndex: 1,
            difficulty: 'medium',
            citation: {
              source: 'Chapter 1: Chemical Reactions and Redox',
              section: '1.2 Decomposition Reaction',
              page: 1,
              snippet: 'Thermal: 2FeSO4(s) --(Heat)--> Fe2O3(s) + SO2(g) + SO3(g) (Notice the brown ferric oxide residue and suffocating sulfur smell).',
            },
          },
        ]),
      ]
    );

    for (const att of SAMPLE_PRESEEDED_ATTEMPTS) {
      await client.query(
        `INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, correct_count, responses, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          `att_${targetUserId}_${att.attemptNumber}`,
          quizId,
          targetUserId,
          att.score,
          att.responses.length,
          att.responses.filter(r => r.score === 1).length,
          JSON.stringify(att.responses.map(r => ({ ...r, topicId: topicIdMap.get(r.topicId) }))),
          att.date,
        ]
      );
    }

    for (const t of SAMPLE_TOPICS) {
      const dbTopicId = topicIdMap.get(t.id);
      const records = [];
      for (const att of SAMPLE_PRESEEDED_ATTEMPTS) {
        for (const r of att.responses) {
          if (r.topicId === t.id) {
            records.push({
              questionId: `q_${r.question.slice(0, 10)}`,
              topicId: dbTopicId,
              difficulty: 'medium',
              score: r.score,
              attemptIndex: att.attemptNumber,
              attemptDate: att.date,
            });
          }
        }
      }

      const mastery = computeTopicMastery(dbTopicId, records, t.examFrequency);
      let reason = 'Solid foundational knowledge demonstrated across recent assessments.';
      let misconceptions = [];

      if (mastery.status === 'weak') {
        if (t.id === 'top_photo_nutrition') {
          reason = 'Persistent confusion regarding the light reaction vs dark reaction: student consistently conflates thylakoid photolysis with stroma carbon fixation.';
          misconceptions = ['Thylakoid vs Stroma localization', 'Photolysis electron donor mechanics'];
        } else if (t.id === 'top_excretion_nephron') {
          reason = 'Struggles with differentiating ultrafiltration in Bowman capsule from active tubular reabsorption in renal tubules.';
          misconceptions = ['Filtration slit permeability', 'Glomerular hydrostatic pressure vs osmotic reabsorption'];
        } else {
          reason = 'High error rate on advanced multi-step questions and equation balancing.';
          misconceptions = ['Balancing stoichiometry', 'Redox electron transfer'];
        }
      } else if (mastery.status === 'medium') {
        reason = 'Decent conceptual grasp, but lost points on edge-case definitions and application questions.';
        misconceptions = ['Enzyme activation pH ranges', 'Double circulation path direction'];
      }

      await client.query(
        `INSERT INTO topic_mastery (id, user_id, topic_id, mastery_score, status, priority_score, reason, misconceptions, attempts_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `mast_${targetUserId}_${t.id}`,
          targetUserId,
          dbTopicId,
          mastery.masteryScore,
          mastery.status,
          mastery.priorityScore,
          reason,
          JSON.stringify(misconceptions),
          records.length,
        ]
      );

      topicsForScheduler.push({
        id: dbTopicId,
        title: t.title,
        unitName: t.unitName,
        masteryScore: mastery.masteryScore,
        priorityScore: mastery.priorityScore,
        status: mastery.status,
        examFrequency: t.examFrequency,
        citationHints: [`Chapter: ${t.unitName}`],
      });
    }

    const plan = generateDeterministicSchedule(topicsForScheduler, 5, 2);
    await client.query(
      `INSERT INTO revision_plans (id, user_id, days_available, hours_per_day, exam_date, schedule, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [`plan_${targetUserId}`, targetUserId, 5, 2, '2026-11-20', JSON.stringify(plan)]
    );

    await client.query('COMMIT');
    console.log('Demo data successfully seeded for demo@gapfinder.ai in Neon!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed execution error:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
