import { OpenAI } from 'openai';

export async function POST(request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { imageData } = await request.json();

    // Ensure imageData is a valid URL or base64 string
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('http')) {
      throw new Error('Invalid image data format');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: 'Name the item, be specific, 1-2 words max' },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const classification = response.choices[0].message.content;
    return new Response(JSON.stringify({ classification }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error classifying image:", error);
    return new Response(JSON.stringify({ error: error.message || 'Error classifying image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}