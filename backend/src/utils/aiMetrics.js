/**
 * 📊 ML OPS UTILS - COST & PERFORMANCE TRACKING
 * AWS Bedrock Cost Estimator (Claude 3.5 Haiku Prices)
 */

const PRICES = {
  "us.anthropic.claude-3-5-haiku-20241022-v1:0": {
    input: 0.25 / 1000000,  // $0.25 per 1M tokens
    output: 1.25 / 1000000  // $1.25 per 1M tokens
  },
  "default": {
    input: 0.000001,
    output: 0.000003
  }
};

const calculateCost = (modelId, usage) => {
  if (!usage) return 0;
  const config = PRICES[modelId] || PRICES.default;
  const inputCost = usage.inputTokens * config.input;
  const outputCost = usage.outputTokens * config.output;
  return parseFloat((inputCost + outputCost).toFixed(7));
};

module.exports = {
  calculateCost
};
