// Test all LLM providers directly
const Groq = require('groq-sdk');
const axios = require('axios');

const GROQ_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyBea33BQwc4E1goo1Ac8espmjpPoHnt3Js';
const OPENROUTER_API_KEY = 'sk-or-v1-20d88e7c4d5c2fa92bd1d8fe56d957041';

async function testGroq() {
  console.log('\n🧪 Testing Groq API...');
  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Say hello in one sentence' }],
    });
    const response = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq Response:', response);
    return true;
  } catch (error) {
    console.error('❌ Groq Failed:', error.message);
    return false;
  }
}

async function testGemini() {
  console.log('\n🧪 Testing Gemini API...');
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: 'Say hello in one sentence' }]
        }]
      }
    );
    const text = response.data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    console.log('✅ Gemini Response:', text);
    return true;
  } catch (error) {
    console.error('❌ Gemini Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testOpenRouter() {
  console.log('\n🧪 Testing OpenRouter API...');
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: 'Say hello in one sentence' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'CognexiaAI ERP Test'
        }
      }
    );
    const text = response.data?.choices?.[0]?.message?.content || '';
    console.log('✅ OpenRouter Response:', text);
    return true;
  } catch (error) {
    console.error('❌ OpenRouter Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('========================================');
  console.log('LLM Provider Testing Suite');
  console.log('========================================');
  
  const results = {
    groq: await testGroq(),
    gemini: await testGemini(),
    openrouter: await testOpenRouter()
  };
  
  console.log('\n========================================');
  console.log('Test Results:');
  console.log('========================================');
  console.log('Groq:', results.groq ? '✅ WORKING' : '❌ FAILED');
  console.log('Gemini:', results.gemini ? '✅ WORKING' : '❌ FAILED');
  console.log('OpenRouter:', results.openrouter ? '✅ WORKING' : '❌ FAILED');
  console.log('========================================\n');
}

runTests().catch(console.error);
