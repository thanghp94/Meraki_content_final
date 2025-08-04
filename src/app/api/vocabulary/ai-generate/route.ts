import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    // Simple AI-like vocabulary generation using a dictionary API or predefined logic
    // In a real implementation, you would use OpenAI, Google AI, or similar service
    const aiGeneratedData = await generateVocabularyData(word.trim());

    return NextResponse.json(aiGeneratedData);
  } catch (error) {
    console.error('Error generating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to generate vocabulary data' },
      { status: 500 }
    );
  }
}

async function generateVocabularyData(word: string) {
  try {
    // Try to fetch from a free dictionary API first
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (response.ok) {
      const data = await response.json();
      const entry = data[0];
      
      if (entry && entry.meanings && entry.meanings.length > 0) {
        const meaning = entry.meanings[0];
        const definition = meaning.definitions[0];
        
        return {
          word: entry.word,
          phoneticTranscription: entry.phonetic || entry.phonetics?.[0]?.text || '',
          partOfSpeech: meaning.partOfSpeech || 'noun',
          definition: definition.definition || '',
          exampleSentence: definition.example || `Here is an example with ${word}.`,
          tags: [meaning.partOfSpeech, 'ai-generated'].filter(Boolean),
          imageUrl: '', // Will be filled by image search
          videoUrl: ''
        };
      }
    }
  } catch (error) {
    console.log('Dictionary API failed, using fallback generation');
  }

  // Fallback: Generate basic vocabulary data
  return generateFallbackVocabulary(word);
}

function generateFallbackVocabulary(word: string) {
  // Simple heuristics for part of speech detection
  const partOfSpeech = detectPartOfSpeech(word);
  
  // Generate basic definition
  const definition = generateBasicDefinition(word, partOfSpeech);
  
  // Generate example sentence
  const exampleSentence = generateExampleSentence(word, partOfSpeech);
  
  // Generate phonetic transcription (simplified)
  const phoneticTranscription = generatePhonetic(word);

  return {
    word: word.toLowerCase(),
    phoneticTranscription,
    partOfSpeech,
    definition,
    exampleSentence,
    tags: [partOfSpeech, 'ai-generated'],
    imageUrl: '',
    videoUrl: ''
  };
}

function detectPartOfSpeech(word: string): string {
  const lowerWord = word.toLowerCase();
  
  // Common suffixes for different parts of speech
  if (lowerWord.endsWith('ing') || lowerWord.endsWith('ed') || lowerWord.endsWith('s')) {
    return 'verb';
  }
  if (lowerWord.endsWith('ly')) {
    return 'adverb';
  }
  if (lowerWord.endsWith('ful') || lowerWord.endsWith('less') || lowerWord.endsWith('ous') || lowerWord.endsWith('ive')) {
    return 'adjective';
  }
  if (lowerWord.endsWith('tion') || lowerWord.endsWith('ness') || lowerWord.endsWith('ment')) {
    return 'noun';
  }
  
  // Default to noun
  return 'noun';
}

function generateBasicDefinition(word: string, partOfSpeech: string): string {
  const templates = {
    noun: [
      `A ${word} is a type of object or concept.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} refers to a specific thing or idea.`,
      `A ${word} is something that exists or can be identified.`
    ],
    verb: [
      `To ${word} means to perform a specific action.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} is an action or process.`,
      `To ${word} is to do something specific.`
    ],
    adjective: [
      `${word.charAt(0).toUpperCase() + word.slice(1)} describes a quality or characteristic.`,
      `Something that is ${word} has a particular quality.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} is used to describe something.`
    ],
    adverb: [
      `${word.charAt(0).toUpperCase() + word.slice(1)} describes how something is done.`,
      `In a ${word.replace('ly', '')} manner.`,
      `${word.charAt(0).toUpperCase() + word.slice(1)} modifies a verb or adjective.`
    ]
  };

  const templateList = templates[partOfSpeech as keyof typeof templates] || templates.noun;
  return templateList[Math.floor(Math.random() * templateList.length)];
}

function generateExampleSentence(word: string, partOfSpeech: string): string {
  const templates = {
    noun: [
      `The ${word} was very important to the story.`,
      `I saw a beautiful ${word} in the garden.`,
      `Every ${word} has its own unique characteristics.`
    ],
    verb: [
      `I like to ${word} every morning.`,
      `She will ${word} tomorrow.`,
      `They ${word} together as a team.`
    ],
    adjective: [
      `The house was very ${word}.`,
      `She felt ${word} about the decision.`,
      `It was a ${word} day for everyone.`
    ],
    adverb: [
      `He spoke ${word} to the audience.`,
      `She worked ${word} on the project.`,
      `The task was completed ${word}.`
    ]
  };

  const templateList = templates[partOfSpeech as keyof typeof templates] || templates.noun;
  return templateList[Math.floor(Math.random() * templateList.length)];
}

function generatePhonetic(word: string): string {
  // Very simplified phonetic generation
  // In a real implementation, you'd use a proper phonetic conversion library
  const vowelMap: { [key: string]: string } = {
    'a': 'æ',
    'e': 'ɛ',
    'i': 'ɪ',
    'o': 'ɔ',
    'u': 'ʌ'
  };

  let phonetic = word.toLowerCase();
  
  // Replace vowels with IPA symbols
  for (const [letter, ipa] of Object.entries(vowelMap)) {
    phonetic = phonetic.replace(new RegExp(letter, 'g'), ipa);
  }

  return `/${phonetic}/`;
}
