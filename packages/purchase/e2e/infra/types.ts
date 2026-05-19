

export interface BrokerEndpoint {
  /**
   * @example http://127.0.0.1:3000
   */
  readonly localBaseURL: string
  /**
   * @example http://dev-puchase-broker.domain.com
   */
  readonly publicBaseURL: string
}

