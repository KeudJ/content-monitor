import OpenAI from 'openai'

export const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY!,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

export const QWEN_MODEL = 'qwen-plus'

export async function qwenChat(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens = 1024
): Promise<string> {
  const res = await qwen.chat.completions.create({
    model: QWEN_MODEL,
    messages,
    max_tokens: maxTokens,
  })
  return res.choices[0].message.content || ''
}
