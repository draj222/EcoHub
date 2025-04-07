// This file handles OpenAI API interactions
// It's intentionally a .js file to avoid TypeScript build errors

export async function getOpenAIResponse(messages, userId) {
  try {
    // Only require OpenAI at runtime
    const { OpenAI } = require('openai');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('[OpenAI Helper] No API key found');
      return null;
    }
    
    console.log('[OpenAI Helper] Initializing OpenAI client');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log(`[OpenAI Helper] Sending request to OpenAI (${messages.length} messages)`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      user: userId
    });
    
    console.log('[OpenAI Helper] Received response from OpenAI');
    const responseMessage = completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
    return responseMessage;
  } catch (error) {
    console.error('[OpenAI Helper] Error:', error);
    return null;
  }
} 