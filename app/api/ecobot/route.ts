import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// Remove direct import of OpenAI

// Define a fallback function to use when OpenAI is not available
const getFallbackResponse = (message: string) => {
  // List of predefined responses about sustainability and eco-friendly practices
  const responses = [
    "Reducing your carbon footprint can be as simple as using reusable bags and bottles, walking or cycling for short trips, and being mindful of energy usage at home.",
    "Solar and wind power are excellent renewable energy sources that can significantly reduce reliance on fossil fuels.",
    "Composting food scraps can reduce methane emissions from landfills and create nutrient-rich soil for your garden.",
    "Machine learning can help optimize energy usage in buildings by predicting peak demand times.",
    "AI can analyze satellite imagery to monitor deforestation and help conservation efforts.",
    "Eating locally grown, seasonal foods reduces the carbon emissions associated with transportation and storage.",
    "Planting native species in your garden supports local wildlife and typically requires less water and maintenance.",
    "Water conservation is crucial for sustainability. Consider installing low-flow fixtures and collecting rainwater for garden use.",
    "Machine learning algorithms can identify patterns in climate data to help predict extreme weather events.",
    "Recycling properly is important - make sure to clean containers and follow local guidelines to ensure materials can actually be processed."
  ];
  
  // Simple keyword matching for more relevant responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('energy') || lowerMessage.includes('power') || lowerMessage.includes('electricity')) {
    return "Renewable energy sources like solar, wind, and hydroelectric power are key to reducing carbon emissions. You could start with small solar panels for specific devices or look into community solar projects.";
  }
  
  if (lowerMessage.includes('water') || lowerMessage.includes('ocean') || lowerMessage.includes('river')) {
    return "Water conservation is essential for sustainability. Consider installing low-flow fixtures, fixing leaks promptly, and using drought-resistant plants in your garden. Protecting water bodies from pollution is also crucial.";
  }
  
  if (lowerMessage.includes('waste') || lowerMessage.includes('plastic') || lowerMessage.includes('recycle')) {
    return "Reducing waste starts with refusing single-use items, repairing instead of replacing, and composting organic matter. When recycling, make sure items are clean and follow local guidelines for proper sorting.";
  }
  
  if (lowerMessage.includes('food') || lowerMessage.includes('agriculture') || lowerMessage.includes('farming')) {
    return "Sustainable food choices include eating locally grown and seasonal foods, reducing meat consumption, and minimizing food waste. Supporting regenerative agriculture practices helps soil health and biodiversity.";
  }
  
  if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml') || lowerMessage.includes('ai')) {
    return "Machine learning can benefit sustainability efforts through optimizing energy usage, predicting weather patterns, monitoring wildlife populations, and improving waste sorting. It's a powerful tool for environmental research and conservation.";
  }
  
  if (lowerMessage.includes('project') || lowerMessage.includes('idea') || lowerMessage.includes('create')) {
    return "For a novel sustainability project, consider creating a community garden with water-saving irrigation, a neighborhood composting system, a local repair cafe to reduce waste, or a citizen science project to monitor local biodiversity. What specific aspects are you interested in?";
  }
  
  // Return a random response if no keywords match
  return responses[Math.floor(Math.random() * responses.length)];
};

const SYSTEM_PROMPT = `You are EcoBot, an AI assistant for the EcoHub platform. 
Your primary purpose is to help users with environmental sustainability topics and eco-friendly projects.

Key responsibilities:
1. Provide accurate information about environmental issues and sustainability practices
2. Offer advice on how to make projects more environmentally friendly
3. Suggest eco-friendly alternatives to common materials or processes
4. Explain machine learning concepts and how they can be applied to environmental projects
5. Be encouraging and supportive of users' eco-friendly initiatives

Your knowledge covers:
- Renewable energy (solar, wind, hydro, geothermal)
- Sustainable agriculture and food systems
- Waste reduction, recycling, and circular economy principles
- Water conservation and management
- Climate change causes, effects, and mitigation strategies
- Biodiversity and ecosystem preservation
- Green building materials and practices
- Machine learning applications for environmental sustainability
- Carbon footprint reduction strategies
- Sustainable transportation

When discussing technical topics, especially ML, provide clear, accessible explanations.
Always respond with practical, actionable advice that users can implement.
If you don't know the answer to something, be honest about it rather than providing incorrect information.
Keep responses concise and relevant to the user's questions.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow non-authenticated users to use the chatbot, but track session if available
    const userId = session?.user?.id || 'anonymous';
    
    const data = await request.json();
    const { message, history = [] } = data;
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Enhanced debugging logs
    console.log(`[EcoBot DEBUG] Request received for: "${message}"`);
    console.log(`[EcoBot DEBUG] API key status: ${process.env.OPENAI_API_KEY ? 'Key exists with length ' + process.env.OPENAI_API_KEY.length : 'No key found'}`);
    console.log(`[EcoBot DEBUG] Message history length: ${history.length}`);
    
    let responseMessage = null;
    
    // Try to use OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      console.log('[EcoBot DEBUG] Attempting to use OpenAI API');
      
      try {
        // Format conversation history for OpenAI
        console.log('[EcoBot DEBUG] Formatting messages');
        const formattedMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ];
        
        // Use the separate helper to avoid build-time issues
        console.log('[EcoBot DEBUG] Using OpenAI helper');
        
        // FIXED: Use a relative import path instead of absolute path
        // Try multiple methods to import the helper
        let helper = null;
        try {
          // Method 1: Standard dynamic import
          helper = await import('@/app/lib/openai-helper.js');
          console.log('[EcoBot DEBUG] Successfully imported helper using standard import');
        } catch (importError) {
          console.log('[EcoBot DEBUG] Standard import failed, trying alternative method');
          try {
            // Method 2: Try using require
            helper = { getOpenAIResponse: require('@/app/lib/openai-helper.js').getOpenAIResponse };
            console.log('[EcoBot DEBUG] Successfully imported helper using require');
          } catch (requireError) {
            console.log('[EcoBot DEBUG] Require method failed too, trying direct path');
            try {
              // Method 3: Last resort - try using Function with relative path
              helper = await Function('return import("../../lib/openai-helper.js")')();
              console.log('[EcoBot DEBUG] Successfully imported helper using Function with relative path');
            } catch (finalError) {
              console.error('[EcoBot ERROR] All import methods failed:', finalError);
            }
          }
        }
        
        if (helper && helper.getOpenAIResponse) {
          console.log('[EcoBot DEBUG] Helper found, calling OpenAI');
          responseMessage = await helper.getOpenAIResponse(formattedMessages, userId);
          if (responseMessage) {
            console.log('[EcoBot DEBUG] OpenAI response received:', responseMessage.substring(0, 50) + '...');
          } else {
            console.log('[EcoBot DEBUG] OpenAI returned null response');
          }
        } else {
          console.log('[EcoBot DEBUG] Helper not found or invalid, falling back');
        }
      } catch (openaiError) {
        // Log detailed error information
        console.error('[EcoBot ERROR] OpenAI API error:', openaiError);
        console.log('[EcoBot ERROR] Falling back to local responses due to OpenAI API error');
      }
    } else {
      console.log('[EcoBot DEBUG] No API key found, using fallback responses');
    }
    
    // If we didn't get a response from OpenAI, use the fallback
    if (!responseMessage) {
      console.log('[EcoBot DEBUG] Using fallback response system');
      responseMessage = getFallbackResponse(message);
      console.log(`[EcoBot DEBUG] Selected fallback response: "${responseMessage}"`);
    }
    
    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('[EcoBot ERROR] Unexpected error in EcoBot API:', error);
    
    // Provide a fallback response in case of errors
    const fallbackResponse = "I'm having trouble connecting to my knowledge base right now. Here's a general tip: Consider starting small with sustainability actions like reducing single-use plastics, conserving water, or using energy-efficient appliances. These steps make a difference!";
    
    return NextResponse.json({ message: fallbackResponse });
  }
} 