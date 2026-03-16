
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function listModels() {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  try {
    const models = await groq.models.list();
    console.log('Available Models:');
    models.data.forEach((model) => {
      console.log(`- ${model.id} (Owner: ${model.owned_by})`);
    });

    // Test Mixtral specifically
    console.log('\nTesting Mixtral-8x7b-32768 availability...');
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'mixtral-8x7b-32768',
      });
      console.log('Success! Mixtral is working.');
    } catch (e: any) {
      console.log('Mixtral test failed:', e.message);
    }
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();
