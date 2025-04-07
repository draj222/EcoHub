// This file handles OpenAI API interactions
// It's intentionally a .js file to avoid TypeScript build errors

export async function getOpenAIResponse(messages, userId) {
  try {
    // Show debugging info
    console.log('[OpenAI Helper] Starting OpenAI request');
    console.log('[OpenAI Helper] API Key available:', !!process.env.OPENAI_API_KEY);
    console.log('[OpenAI Helper] Message count:', messages.length);

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('[OpenAI Helper] No API key found');
      return null;
    }

    // Try to load OpenAI dynamically
    let OpenAI;
    try {
      OpenAI = (await import('openai')).default;
      console.log('[OpenAI Helper] OpenAI imported via ESM');
    } catch (importError) {
      console.log('[OpenAI Helper] ESM import failed, trying CommonJS');
      try {
        // Fallback to CommonJS
        OpenAI = require('openai');
        console.log('[OpenAI Helper] OpenAI imported via CommonJS');
      } catch (requireError) {
        console.error('[OpenAI Helper] Failed to import OpenAI:', requireError);
        return null;
      }
    }
    
    console.log('[OpenAI Helper] Initializing OpenAI client');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log(`[OpenAI Helper] Sending request to OpenAI (${messages.length} messages)`);
    console.log('[OpenAI Helper] Messages sample:', 
      messages.map(m => ({ role: m.role, content: m.content?.substring(0, 20) + '...' })));
    
    // Make the API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      user: userId
    });
    
    console.log('[OpenAI Helper] Response received from OpenAI');
    
    // Validate response
    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('[OpenAI Helper] Invalid response format from OpenAI');
      return null;
    }
    
    const responseMessage = completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
    console.log('[OpenAI Helper] Response content:', responseMessage.substring(0, 50) + '...');
    
    return responseMessage;
  } catch (error) {
    console.error('[OpenAI Helper] Error:', error);
    console.error('[OpenAI Helper] Error name:', error.name);
    console.error('[OpenAI Helper] Error message:', error.message);
    console.error('[OpenAI Helper] Error stack:', error.stack);
    
    if (error.response) {
      console.error('[OpenAI Helper] OpenAI API error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return null;
  }
} 