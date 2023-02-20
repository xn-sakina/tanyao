export interface ICodeBase {
  url: string
  username?: string
  email?: string
  sign_key?: string
}

export interface ITanyaoConfig {
  base: string | string[]
  codebase: ICodeBase[]
  alias?: Record<string, string>
}

export interface ICloneOptions {
  /**
   * @default false
   */
  progress: boolean
}
