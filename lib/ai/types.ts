export type AiProtocol = 'claude' | 'openai'

export interface AiConfig {
  protocol: AiProtocol
  baseUrl: string
  apiKey: string
  model: string
}

export interface RepoAnalysis {
  summary: string
  problemSolved: string
  useCases: string
  limitations: string
}
