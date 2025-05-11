
import { GeminiResponse } from '@/types/gemini';
import { toast } from '@/components/ui/use-toast';

let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
  // Save to localStorage for persistence
  localStorage.setItem('gemini_api_key', key);
};

export const getApiKey = () => {
  if (!apiKey) {
    // Try to get from localStorage
    apiKey = localStorage.getItem('gemini_api_key') || '';
  }
  return apiKey;
};

export const hasApiKey = () => !!getApiKey();

export const generateWebsite = async (prompt: string): Promise<string> => {
  const key = getApiKey();
  
  if (!key) {
    throw new Error('API key not set');
  }
  
  const systemPrompt = `
You are an AI web developer assistant that generates complete, self-contained HTML files with embedded CSS and JavaScript.

ALWAYS include:
- Proper HTML5 structure with DOCTYPE
- Internal CSS in a <style> tag
- JavaScript functionality in a <script> tag
- Modern design with responsive layout
- Error handling and good UX principles

NEVER:
- Use external dependencies or CDN links
- Return incomplete code
- Return multiple versions or code variations

When given a website description, create a COMPLETE and WORKING implementation.
`;

  const userPrompt = `Create a complete, self-contained website for: ${prompt}
  
The response must be a SINGLE HTML file that includes all CSS and JavaScript inline.
The website should look professional, be responsive, and implement the requested functionality.

Return ONLY the full HTML code without any explanations or markdown formatting.`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  
  try {
    const response = await fetch(`${url}?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will generate complete, self-contained HTML files with embedded CSS and JavaScript based on the user\'s requirements.' }]
          },
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      // Check for quota limit errors
      if (response.status === 429) {
        const errorMessage = errorData.error?.message || 'API quota exceeded';
        if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          throw new Error('Gemini API quota exceeded. Please try again later or upgrade your Gemini API plan.');
        }
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract HTML from the response
    let htmlCode = generatedText;
    
    // Handle the case where the response includes ```html tags
    if (htmlCode.includes('```html')) {
      htmlCode = htmlCode.split('```html')[1].split('```')[0].trim();
    } else if (htmlCode.includes('```')) {
      htmlCode = htmlCode.split('```')[1].split('```')[0].trim();
    }

    return htmlCode;
  } catch (error) {
    console.error('Error generating website:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    toast({
      title: "Error",
      description: `Failed to generate website: ${errorMessage}`,
      variant: "destructive",
    });
    
    throw error;
  }
};

export const improveWebsite = async (currentCode: string, improvement: string): Promise<string> => {
  const key = getApiKey();
  
  if (!key) {
    throw new Error('API key not set');
  }
  
  const prompt = `
I have this existing website code:

\`\`\`html
${currentCode}
\`\`\`

Please improve it according to the following requirements: ${improvement}

Return ONLY the complete, improved HTML code without any explanations or markdown formatting.
`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  
  try {
    const response = await fetch(`${url}?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      // Check for quota limit errors
      if (response.status === 429) {
        const errorMessage = errorData.error?.message || 'API quota exceeded';
        if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          throw new Error('Gemini API quota exceeded. Please try again later or upgrade your Gemini API plan.');
        }
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract HTML from the response
    let htmlCode = generatedText;
    
    // Handle the case where the response includes ```html tags
    if (htmlCode.includes('```html')) {
      htmlCode = htmlCode.split('```html')[1].split('```')[0].trim();
    } else if (htmlCode.includes('```')) {
      htmlCode = htmlCode.split('```')[1].split('```')[0].trim();
    }

    return htmlCode;
  } catch (error) {
    console.error('Error improving website:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    toast({
      title: "Error", 
      description: `Failed to improve website: ${errorMessage}`,
      variant: "destructive",
    });
    
    throw error;
  }
};
