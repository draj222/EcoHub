import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

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
  
  // Return a random response if no keywords match
  return responses[Math.floor(Math.random() * responses.length)];
};

let openai: any;
try {
  // Dynamically import OpenAI to prevent build issues
  openai = require('openai');
} catch (error) {
  console.warn('OpenAI package not available, using fallback responses');
}

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
    
    // Check if OpenAI is available
    const OpenAI = openai;
    if (!OpenAI || !process.env.OPENAI_API_KEY) {
      console.log('Using fallback response as OpenAI is not configured');
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({ message: fallbackResponse });
    }
    
    // Initialize OpenAI client
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Format conversation history for OpenAI
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    // Get response from OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
      user: userId
    });
    
    const responseMessage = completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
    
    // Log the conversation (optional)
    console.log(`[EcoBot] User: ${message}`);
    console.log(`[EcoBot] Bot: ${responseMessage}`);
    
    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error in EcoBot API:', error);
    
    // Provide a fallback response in case of errors
    const fallbackResponse = "I'm having trouble connecting to my knowledge base right now. Here's a general tip: Consider starting small with sustainability actions like reducing single-use plastics, conserving water, or using energy-efficient appliances. These steps make a difference!";
    
    return NextResponse.json({ message: fallbackResponse });
  }
} 