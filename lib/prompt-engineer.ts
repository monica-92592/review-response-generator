import { AIProvider } from './ai-providers'

// Types for prompt engineering
export interface ReviewData {
  text: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
  provider?: AIProvider
  variation?: number
  toneAdjustments?: {
    formality?: number
    empathy?: number
    enthusiasm?: number
    professionalism?: number
  }
  useTemplate?: string | null
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number
  keyTopics: string[]
  emotions: string[]
}

export interface PromptTemplate {
  system: string
  user: string
  maxTokens: number
  temperature: number
}

export interface ResponseValidation {
  isValid: boolean
  score: number
  issues: string[]
  suggestions: string[]
}

// Sentiment analysis function
export const analyzeSentiment = (reviewText: string, rating: string): SentimentAnalysis => {
  const text = reviewText.toLowerCase()
  const ratingNum = parseInt(rating)
  
  // Positive indicators
  const positiveWords = [
    'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding',
    'perfect', 'love', 'awesome', 'best', 'good', 'nice', 'happy', 'satisfied',
    'pleased', 'impressed', 'recommend', 'exceeded', 'surpassed', 'delighted'
  ]
  
  // Negative indicators
  const negativeWords = [
    'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointed',
    'unhappy', 'frustrated', 'angry', 'upset', 'disgusted', 'hate', 'never',
    'avoid', 'waste', 'ripoff', 'scam', 'useless', 'broken', 'failed'
  ]
  
  // Neutral/mixed indicators
  const neutralWords = [
    'okay', 'fine', 'average', 'decent', 'acceptable', 'adequate',
    'mediocre', 'ordinary', 'standard', 'normal', 'typical'
  ]
  
  // Count word occurrences
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  const neutralCount = neutralWords.filter(word => text.includes(word)).length
  
  // Analyze rating impact
  let ratingSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
  if (ratingNum >= 4) ratingSentiment = 'positive'
  else if (ratingNum <= 2) ratingSentiment = 'negative'
  
  // Determine overall sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  let confidence = 0.5
  
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    sentiment = 'positive'
    confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1))
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    sentiment = 'negative'
    confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1))
  } else if (neutralCount > positiveCount && neutralCount > negativeCount) {
    sentiment = 'neutral'
    confidence = Math.min(0.9, 0.5 + (neutralCount * 0.1))
  } else {
    sentiment = 'mixed'
    confidence = 0.6
  }
  
  // Adjust confidence based on rating consistency
  if ((sentiment === 'positive' && ratingSentiment === 'positive') ||
      (sentiment === 'negative' && ratingSentiment === 'negative')) {
    confidence = Math.min(0.95, confidence + 0.2)
  } else if (sentiment !== ratingSentiment) {
    confidence = Math.max(0.3, confidence - 0.2)
  }
  
  // Extract key topics
  const topics = extractTopics(text)
  
  // Extract emotions
  const emotions = extractEmotions(text)
  
  return {
    sentiment,
    confidence,
    keyTopics: topics,
    emotions
  }
}

// Extract key topics from review text
const extractTopics = (text: string): string[] => {
  const topics: string[] = []
  
  // Service-related topics
  if (text.includes('service') || text.includes('staff') || text.includes('employee')) {
    topics.push('customer service')
  }
  if (text.includes('food') || text.includes('meal') || text.includes('dish')) {
    topics.push('food quality')
  }
  if (text.includes('price') || text.includes('cost') || text.includes('expensive') || text.includes('cheap')) {
    topics.push('pricing')
  }
  if (text.includes('clean') || text.includes('dirty') || text.includes('hygiene')) {
    topics.push('cleanliness')
  }
  if (text.includes('wait') || text.includes('time') || text.includes('slow') || text.includes('fast')) {
    topics.push('speed/efficiency')
  }
  if (text.includes('atmosphere') || text.includes('ambiance') || text.includes('environment')) {
    topics.push('atmosphere')
  }
  if (text.includes('location') || text.includes('parking') || text.includes('access')) {
    topics.push('location/accessibility')
  }
  
  return topics.length > 0 ? topics : ['general experience']
}

// Extract emotions from review text
const extractEmotions = (text: string): string[] => {
  const emotions: string[] = []
  
  if (text.includes('happy') || text.includes('joy') || text.includes('excited')) {
    emotions.push('happy')
  }
  if (text.includes('angry') || text.includes('furious') || text.includes('mad')) {
    emotions.push('angry')
  }
  if (text.includes('sad') || text.includes('disappointed') || text.includes('upset')) {
    emotions.push('sad')
  }
  if (text.includes('surprised') || text.includes('shocked') || text.includes('amazed')) {
    emotions.push('surprised')
  }
  if (text.includes('frustrated') || text.includes('annoyed') || text.includes('irritated')) {
    emotions.push('frustrated')
  }
  if (text.includes('grateful') || text.includes('thankful') || text.includes('appreciate')) {
    emotions.push('grateful')
  }
  
  return emotions
}

// Create advanced prompt template
export const createAdvancedPrompt = (reviewData: ReviewData): PromptTemplate => {
  const sentiment = analyzeSentiment(reviewData.text, reviewData.rating)
  const businessContext = getAdvancedBusinessContext(reviewData.businessType, sentiment)
  const toneInstructions = getAdvancedToneInstructions(reviewData.tone, sentiment, reviewData.toneAdjustments)
  const lengthInstructions = getAdvancedLengthInstructions(reviewData.responseLength, sentiment)
  const sentimentStrategy = getSentimentStrategy(sentiment)
  const variationInstructions = getVariationInstructions(reviewData.variation)
  const templateInstructions = getTemplateInstructions(reviewData.useTemplate)
  
  const systemPrompt = `You are an expert customer service representative with deep knowledge of ${reviewData.businessType} businesses. Your role is to craft authentic, contextually appropriate responses to customer reviews.

${businessContext}

${toneInstructions}

${sentimentStrategy}

${variationInstructions}

${templateInstructions}

Key Guidelines:
- Address specific feedback mentioned in the review
- Acknowledge the customer's experience and emotions
- Provide appropriate solutions or acknowledgments
- Maintain brand voice and professionalism
- Encourage future engagement when appropriate
- Keep responses genuine and personalized

${lengthInstructions}

Always respond with just the review response text, no additional formatting or explanations.`

  const userPrompt = `Review: "${reviewData.text}"
Rating: ${reviewData.rating} stars
Sentiment Analysis: ${sentiment.sentiment} (confidence: ${Math.round(sentiment.confidence * 100)}%)
Key Topics: ${sentiment.keyTopics.join(', ')}
Emotions Detected: ${sentiment.emotions.length > 0 ? sentiment.emotions.join(', ') : 'neutral'}

Please write a response that addresses the specific feedback while maintaining the appropriate tone and length.`

  return {
    system: systemPrompt,
    user: userPrompt,
    maxTokens: getMaxTokens(reviewData.responseLength, sentiment),
    temperature: getTemperature(sentiment, reviewData.tone, reviewData.variation)
  }
}

// Get advanced business context
const getAdvancedBusinessContext = (businessType: string, sentiment: SentimentAnalysis): string => {
  const baseContexts: Record<string, string> = {
    restaurant: `Restaurant/food service business context:
- Focus on food quality, taste, presentation, and freshness
- Consider service speed, staff friendliness, and attentiveness
- Address atmosphere, cleanliness, and dining experience
- Acknowledge pricing, portion sizes, and value for money
- Consider dietary restrictions and special requests`,
    
    retail: `Retail/e-commerce business context:
- Focus on product quality, selection, and availability
- Consider customer service, staff knowledge, and helpfulness
- Address shopping experience, store layout, and convenience
- Acknowledge pricing, promotions, and value
- Consider return policies and after-sales support`,
    
    healthcare: `Healthcare/medical business context:
- Focus on patient care, medical expertise, and professionalism
- Consider communication, empathy, and bedside manner
- Address wait times, appointment scheduling, and accessibility
- Acknowledge facility cleanliness and safety
- Consider follow-up care and patient education`,
    
    professional: `Professional services business context:
- Focus on expertise, reliability, and professional standards
- Consider communication, responsiveness, and attention to detail
- Address project delivery, timelines, and quality of work
- Acknowledge pricing, value, and return on investment
- Consider ongoing support and relationship building`,
    
    hospitality: `Hospitality/travel business context:
- Focus on guest experience, accommodations, and amenities
- Consider staff hospitality, local knowledge, and service quality
- Address cleanliness, comfort, and safety
- Acknowledge location, accessibility, and value
- Consider special requests and personalized service`,
    
    technology: `Technology/software business context:
- Focus on product functionality, reliability, and user experience
- Consider technical support, documentation, and ease of use
- Address performance, features, and innovation
- Acknowledge pricing, licensing, and value
- Consider updates, maintenance, and customer success`,
    
    other: `General business context:
- Focus on overall customer satisfaction and service quality
- Consider all aspects of the customer experience
- Address specific feedback and concerns raised
- Acknowledge business strengths and areas for improvement
- Consider customer relationship and future engagement`
  }
  
  return baseContexts[businessType] || baseContexts.other
}

// Get advanced tone instructions
const getAdvancedToneInstructions = (tone: string, sentiment: SentimentAnalysis, toneAdjustments?: {
  formality?: number
  empathy?: number
  enthusiasm?: number
  professionalism?: number
}): string => {
  const baseInstructions: Record<string, string> = {
    professional: `Professional tone requirements:
- Use formal, business-appropriate language
- Maintain courteous and respectful communication
- Demonstrate expertise and competence
- Be diplomatic and solution-oriented
- Avoid overly casual or emotional language`,
    
    friendly: `Friendly tone requirements:
- Use warm, approachable, and personable language
- Show genuine interest and care for the customer
- Be conversational while maintaining professionalism
- Use positive and encouraging language
- Create a welcoming and comfortable atmosphere`,
    
    formal: `Formal tone requirements:
- Use very formal, corporate-level language
- Maintain strict professional standards
- Be respectful and proper in all communications
- Use traditional business etiquette
- Avoid any casual or informal expressions`,
    
    casual: `Casual tone requirements:
- Use relaxed, conversational, and informal language
- Be approachable and easy-going
- Use everyday language that feels natural
- Maintain friendliness without being overly formal
- Create a comfortable, laid-back atmosphere`,
    
    empathetic: `Empathetic tone requirements:
- Show deep understanding and compassion
- Acknowledge and validate customer feelings
- Use supportive and caring language
- Demonstrate emotional intelligence
- Provide comfort and reassurance when appropriate`
  }
  
  let instructions = baseInstructions[tone] || baseInstructions.professional
  
  // Adjust tone based on sentiment
  if (sentiment.sentiment === 'negative') {
    instructions += '\n\nSpecial considerations for negative feedback:\n- Show extra empathy and understanding\n- Acknowledge the customer\'s concerns sincerely\n- Focus on solutions and improvements\n- Demonstrate commitment to better service'
  } else if (sentiment.sentiment === 'positive') {
    instructions += '\n\nSpecial considerations for positive feedback:\n- Express genuine gratitude and appreciation\n- Reinforce positive experiences\n- Encourage continued engagement\n- Share the positive feedback with the team'
  }
  
  // Adjust tone based on tone adjustments
  if (toneAdjustments) {
    if (toneAdjustments.formality) {
      instructions += `\n\nFormality adjustment: ${toneAdjustments.formality}`
    }
    if (toneAdjustments.empathy) {
      instructions += `\n\nEmpathy adjustment: ${toneAdjustments.empathy}`
    }
    if (toneAdjustments.enthusiasm) {
      instructions += `\n\nEnthusiasm adjustment: ${toneAdjustments.enthusiasm}`
    }
    if (toneAdjustments.professionalism) {
      instructions += `\n\nProfessionalism adjustment: ${toneAdjustments.professionalism}`
    }
  }
  
  return instructions
}

// Get sentiment-specific strategy
const getSentimentStrategy = (sentiment: SentimentAnalysis): string => {
  switch (sentiment.sentiment) {
    case 'positive':
      return `Positive Review Strategy:
- Express genuine gratitude and appreciation
- Reinforce the positive aspects mentioned
- Share how the feedback motivates the team
- Encourage continued patronage and referrals
- Highlight commitment to maintaining high standards`
    
    case 'negative':
      return `Negative Review Strategy:
- Acknowledge the customer's experience sincerely
- Show understanding of their concerns
- Provide specific solutions or improvements
- Demonstrate commitment to better service
- Offer appropriate compensation or resolution when warranted`
    
    case 'neutral':
      return `Neutral Review Strategy:
- Thank the customer for their balanced feedback
- Acknowledge both positive and negative aspects
- Show commitment to improvement in areas mentioned
- Encourage future engagement to provide better experiences`
    
    case 'mixed':
      return `Mixed Review Strategy:
- Acknowledge the complexity of their experience
- Thank them for the positive aspects
- Address concerns with specific solutions
- Show appreciation for their detailed feedback
- Demonstrate commitment to improvement`
    
    default:
      return `General Strategy:
- Thank the customer for their feedback
- Address specific points mentioned in the review
- Show commitment to customer satisfaction
- Encourage future engagement`
  }
}

// Get advanced length instructions
const getAdvancedLengthInstructions = (length: string, sentiment: SentimentAnalysis): string => {
  const baseInstructions: Record<string, string> = {
    short: 'Response length: 1-2 sentences maximum. Be concise but impactful.',
    medium: 'Response length: 2-3 sentences. Provide adequate detail and context.',
    long: 'Response length: 3-4 sentences. Be comprehensive and detailed.'
  }
  
  let instructions = baseInstructions[length] || baseInstructions.medium
  
  // Adjust length based on sentiment
  if (sentiment.sentiment === 'negative') {
    instructions += ' For negative reviews, ensure the response is thorough enough to address concerns properly.'
  }
  
  return instructions
}

// Get max tokens based on length and sentiment
const getMaxTokens = (length: string, sentiment: SentimentAnalysis): number => {
  const baseTokens: Record<string, number> = {
    short: 100,
    medium: 150,
    long: 200
  }
  
  let tokens = baseTokens[length] || 150
  
  // Increase tokens for negative reviews to allow for more detailed responses
  if (sentiment.sentiment === 'negative') {
    tokens = Math.round(tokens * 1.2)
  }
  
  return tokens
}

// Get temperature based on sentiment and tone
const getTemperature = (sentiment: SentimentAnalysis, tone: string, variation?: number): number => {
  let baseTemp = 0.7
  
  // Adjust for tone
  switch (tone) {
    case 'casual':
      baseTemp = 0.8
      break
    case 'friendly':
      baseTemp = 0.75
      break
    case 'formal':
      baseTemp = 0.6
      break
    case 'professional':
      baseTemp = 0.65
      break
    case 'empathetic':
      baseTemp = 0.7
      break
  }
  
  // Adjust for sentiment
  if (sentiment.sentiment === 'negative') {
    baseTemp = Math.max(0.5, baseTemp - 0.1) // More controlled for negative reviews
  } else if (sentiment.sentiment === 'positive') {
    baseTemp = Math.min(0.9, baseTemp + 0.05) // Slightly more creative for positive reviews
  }
  
  // Adjust for variation
  if (variation) {
    baseTemp += variation * 0.05
  }
  
  return baseTemp
}

// Response quality validation
export const validateResponse = (
  response: string,
  reviewData: ReviewData,
  sentiment: SentimentAnalysis
): ResponseValidation => {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100
  
  // Length validation
  const wordCount = response.split(' ').length
  const expectedLength = reviewData.responseLength === 'short' ? 10 : 
                        reviewData.responseLength === 'medium' ? 25 : 40
  
  if (wordCount < expectedLength * 0.5) {
    issues.push('Response is too short')
    score -= 15
  } else if (wordCount > expectedLength * 2) {
    issues.push('Response is too long')
    score -= 10
  }
  
  // Sentiment consistency
  const responseSentiment = analyzeSentiment(response, '5') // Assume positive for response
  if (sentiment.sentiment === 'negative' && responseSentiment.sentiment === 'positive') {
    // This is actually good - we want positive responses to negative reviews
    score += 5
  } else if (sentiment.sentiment === 'positive' && responseSentiment.sentiment === 'negative') {
    issues.push('Response tone doesn\'t match positive review')
    score -= 20
  }
  
  // Business context validation
  const businessKeywords = getBusinessKeywords(reviewData.businessType)
  const hasBusinessContext = businessKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  )
  
  if (!hasBusinessContext) {
    suggestions.push('Consider adding more business-specific context')
    score -= 5
  }
  
  // Tone validation
  const toneKeywords = getToneKeywords(reviewData.tone)
  const hasAppropriateTone = toneKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  )
  
  if (!hasAppropriateTone) {
    suggestions.push('Consider adjusting tone to match requested style')
    score -= 10
  }
  
  // Grammar and professionalism
  if (response.includes('!') && reviewData.tone === 'formal') {
    suggestions.push('Consider using fewer exclamation marks for formal tone')
    score -= 5
  }
  
  if (response.includes('?') && sentiment.sentiment === 'negative') {
    suggestions.push('Avoid questions in responses to negative reviews')
    score -= 5
  }
  
  // Personalization check
  const reviewWords = reviewData.text.toLowerCase().split(' ').filter(word => word.length > 3)
  const responseWords = response.toLowerCase().split(' ')
  const commonWords = reviewWords.filter(word => responseWords.includes(word))
  
  if (commonWords.length < 2) {
    suggestions.push('Consider referencing specific points from the review')
    score -= 10
  }
  
  // Gratitude check
  const gratitudeWords = ['thank', 'appreciate', 'grateful', 'thanks']
  const hasGratitude = gratitudeWords.some(word => response.toLowerCase().includes(word))
  
  if (!hasGratitude) {
    suggestions.push('Consider adding a thank you or appreciation')
    score -= 5
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions
  }
}

// Get business-specific keywords
const getBusinessKeywords = (businessType: string): string[] => {
  const keywords: Record<string, string[]> = {
    restaurant: ['food', 'service', 'dining', 'meal', 'dish', 'chef', 'kitchen', 'menu'],
    retail: ['product', 'shopping', 'store', 'purchase', 'item', 'selection', 'quality'],
    healthcare: ['care', 'patient', 'medical', 'health', 'treatment', 'doctor', 'nurse'],
    professional: ['service', 'professional', 'expertise', 'quality', 'work', 'project'],
    hospitality: ['stay', 'guest', 'hotel', 'accommodation', 'comfort', 'service'],
    technology: ['software', 'product', 'feature', 'technology', 'system', 'platform'],
    other: ['service', 'experience', 'quality', 'business']
  }
  
  return keywords[businessType] || keywords.other
}

// Get tone-specific keywords
const getToneKeywords = (tone: string): string[] => {
  const keywords: Record<string, string[]> = {
    professional: ['appreciate', 'regard', 'ensure', 'maintain', 'professional'],
    friendly: ['happy', 'glad', 'pleased', 'welcome', 'friendly'],
    formal: ['respectfully', 'sincerely', 'regards', 'formal', 'proper'],
    casual: ['great', 'awesome', 'cool', 'nice', 'casual'],
    empathetic: ['understand', 'feel', 'concern', 'care', 'empathy']
  }
  
  return keywords[tone] || keywords.professional
}

// Get variation instructions
const getVariationInstructions = (variation?: number): string => {
  if (!variation || variation === 1) return ''
  
  const variationStyles = [
    '',
    'Standard professional response',
    'More conversational and friendly approach',
    'Formal and detailed response',
    'Brief and concise response',
    'Emotional and empathetic response'
  ]
  
  return `\nVariation Style: ${variationStyles[Math.min(variation, variationStyles.length - 1)]}`
}

// Get template instructions
const getTemplateInstructions = (useTemplate?: string | null): string => {
  if (!useTemplate) return ''
  
  return `\nTemplate Integration: Use the following template as a starting point and adapt it to the specific review:
"${useTemplate}"

Modify the template to address the specific feedback while maintaining the core message and tone.`
}

export default {
  analyzeSentiment,
  createAdvancedPrompt,
  validateResponse
} 