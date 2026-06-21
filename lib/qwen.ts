import OpenAI from 'openai'

const QWEN_MODEL = 'qwen-plus'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.QWEN_API_KEY!,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    })
  }
  return _client
}

export async function qwenChat(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  maxTokens = 1024
): Promise<string> {
  const res = await getClient().chat.completions.create({
    model: QWEN_MODEL,
    messages,
    max_tokens: maxTokens,
  })
  return res.choices[0].message.content || ''
}
