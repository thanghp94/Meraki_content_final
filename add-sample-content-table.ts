import { addContentToDatabase } from './src/lib/databaseService';

async function addSampleContentToTable() {
  try {
    console.log('Adding sample content to content table...');
    
    // Sample content entries
    const contentEntries = [
      {
        id: 'math-basics',
        name: 'Math Basics',
        description: 'Basic mathematics questions covering addition, multiplication, and square roots',
        topic: 'Mathematics',
        thumbnailUrl: 'https://placehold.co/600x400.png?text=Math+Basics'
      },
      {
        id: 'science-basics',
        name: 'Science Fundamentals',
        description: 'Basic science questions covering chemistry, biology, and astronomy',
        topic: 'Science',
        thumbnailUrl: 'https://placehold.co/600x400.png?text=Science+Basics'
      },
      {
        id: 'world-history',
        name: 'World History',
        description: 'Important events and figures in world history',
        topic: 'History',
        thumbnailUrl: 'https://placehold.co/600x400.png?text=World+History'
      },
      {
        id: 'english-grammar',
        name: 'English Grammar',
        description: 'Grammar rules and language structure',
        topic: 'English',
        thumbnailUrl: 'https://placehold.co/600x400.png?text=English+Grammar'
      },
      {
        id: 'geography-basics',
        name: 'Geography Basics',
        description: 'Countries, capitals, and geographical features',
        topic: 'Geography',
        thumbnailUrl: 'https://placehold.co/600x400.png?text=Geography+Basics'
      }
    ];

    for (const contentData of contentEntries) {
      try {
        const contentId = await addContentToDatabase(contentData);
        console.log(`Added content: ${contentData.name} (ID: ${contentId})`);
      } catch (error) {
        console.error(`Failed to add content: ${contentData.name}`, error);
      }
    }

    console.log(`Successfully added ${contentEntries.length} content entries to the content table`);
    
  } catch (error) {
    console.error('Error adding sample content to table:', error);
  }
}

addSampleContentToTable();
