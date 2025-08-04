// Test script to debug vocabulary extraction
const { extractVocabularyWords } = require('./src/lib/utils.ts');

// Test with sample content that should contain vocabulary
const testContent = "tent, camping, snow";
const testContent2 = "tent/camping/snow";
const testContent3 = "tent, camping gear, snow boots";

console.log('Testing vocabulary extraction:');
console.log('Input 1:', testContent);
console.log('Output 1:', extractVocabularyWords(testContent));

console.log('\nInput 2:', testContent2);
console.log('Output 2:', extractVocabularyWords(testContent2));

console.log('\nInput 3:', testContent3);
console.log('Output 3:', extractVocabularyWords(testContent3));

// Test with empty/null content
console.log('\nEmpty string:', extractVocabularyWords(''));
console.log('Null:', extractVocabularyWords(null));
console.log('Undefined:', extractVocabularyWords(undefined));
