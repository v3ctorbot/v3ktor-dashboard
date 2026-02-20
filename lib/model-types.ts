import type { Status, TokenUsage } from './types'

export type ModelName = 'glm-4.7' | 'glm-4.7-flash' | 'llama-4' | 'mediapipe'

export type ModelConfig = {
  models: {
    strategic: ModelName
    creative: ModelName
    research: ModelName
    coding: ModelName
    realTime: ModelName
    prototyping: ModelName
    video: ModelName
  }
  defaultModel: ModelName
  providers: {
    zai: {
      base_url: string
      key: string | null
    }
    ollama: {
      local: boolean
      base_url: string
      modelPath: string | null
      params: Record<string, any> | null
    }
  }
}

export type EnhancedStatus = Omit<Status, 'active_sub_agents'> & {
  active_model: ModelName
}

export type ModelUsageWithModel = Omit<TokenUsage, 'estimated_cost'> & {
  model: ModelName
}
