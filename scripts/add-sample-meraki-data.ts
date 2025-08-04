import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addSampleData() {
  const client = await pool.connect();
  
  try {
    // Set search path to meraki schema
    await client.query('SET search_path TO meraki, public');
    
    console.log('Adding sample data to meraki schema...');
    
    // Sample content data
    const contentId1 = uuidv4();
    const contentId2 = uuidv4();
    
    // Insert sample content
    await client.query(`
      INSERT INTO content (id, "Title", infor1, infor2, image1, video1, date_created)
      VALUES 
        ($1, 'Mathematics Basics', 'Introduction to basic mathematical concepts', 'Covers addition, subtraction, multiplication', 'https://example.com/math.jpg', 'https://example.com/math-video.mp4', NOW()),
        ($2, 'Science Fundamentals', 'Basic science principles and concepts', 'Physics, Chemistry, Biology basics', 'https://example.com/science.jpg', 'https://example.com/science-video.mp4', NOW())
    `, [contentId1, contentId2]);
    
    // Sample topic data
    const topicId1 = 'math-topic-1';
    const topicId2 = 'science-topic-1';
    
    await client.query(`
      INSERT INTO topic (id, topic, short_summary, unit, image, parentid, showstudent)
      VALUES 
        ($1, 'Basic Arithmetic', 'Addition and subtraction fundamentals', 'Unit 1', 'https://example.com/arithmetic.jpg', NULL, true),
        ($2, 'Scientific Method', 'Understanding the scientific process', 'Unit 1', 'https://example.com/method.jpg', NULL, true)
    `, [topicId1, topicId2]);
    
    // Sample question data
    const questionId1 = 'q1-' + Date.now();
    const questionId2 = 'q2-' + Date.now();
    const questionId3 = 'q3-' + Date.now();
    const questionId4 = 'q4-' + Date.now();
    
    await client.query(`
      INSERT INTO question (
        id, chuong_trinh, questionlevel, contentid, question_type, noi_dung, 
        picture, cau_tra_loi_1, cau_tra_loi_2, cau_tra_loi_3, cau_tra_loi_4, 
        correct_choice, time, explanation, answer, tg_tao
      )
      VALUES 
        ($1, 'Math Program', 'Basic', $5, 'multiple_choice', 'What is 2 + 2?', 
         'https://example.com/math-q1.jpg', '3', '4', '5', '6', 
         'B', '30', 'Simple addition: 2 + 2 = 4', '4', NOW()),
        ($2, 'Math Program', 'Basic', $5, 'multiple_choice', 'What is 5 - 3?', 
         'https://example.com/math-q2.jpg', '1', '2', '3', '4', 
         'B', '30', 'Simple subtraction: 5 - 3 = 2', '2', NOW()),
        ($3, 'Science Program', 'Intermediate', $6, 'text', 'What is the first step of the scientific method?', 
         'https://example.com/science-q1.jpg', NULL, NULL, NULL, NULL, 
         NULL, '60', 'The first step is observation', 'Observation', NOW()),
        ($4, 'Science Program', 'Intermediate', $6, 'multiple_choice', 'What is H2O?', 
         'https://example.com/science-q2.jpg', 'Oxygen', 'Water', 'Hydrogen', 'Carbon', 
         'B', '45', 'H2O is the chemical formula for water', 'Water', NOW())
    `, [questionId1, questionId2, questionId3, questionId4, contentId1, contentId2]);
    
    console.log('Sample data added successfully!');
    console.log(`Content IDs: ${contentId1}, ${contentId2}`);
    console.log(`Topic IDs: ${topicId1}, ${topicId2}`);
    console.log(`Question IDs: ${questionId1}, ${questionId2}, ${questionId3}, ${questionId4}`);
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addSampleData().catch(console.error);
