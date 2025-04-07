import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can upgrade to gpt-4 for better responses
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
      user: userId // For OpenAI to identify user for rate limiting
    });
    
    const responseMessage = completion.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
    
    // Log the conversation (optional)
    console.log(`[EcoBot] User: ${message}`);
    console.log(`[EcoBot] Bot: ${responseMessage}`);
    
    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error in EcoBot API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 