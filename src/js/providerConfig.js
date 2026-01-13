// 中心化的AI服务商配置模块
class ProviderConfig {
    // 默认API密钥（仅用于DeepSeek）
    static get DEFAULT_API_KEY() {
        return 'sk-13cf1d781bca49d49cd15136a4859607';
    }

    // 获取服务商配置
    static getProviderConfig(provider, model = null, customSettings = null) {
        // 基础配置
        const baseConfigs = {
            deepseek: {
                endpoint: 'https://api.deepseek.com/v1/chat/completions',
                defaultModel: 'deepseek-v3',
                defaultApiKey: this.DEFAULT_API_KEY
            },
            openai: {
                endpoint: 'https://api.openai.com/v1/chat/completions',
                defaultModel: 'gpt-4o',
                defaultApiKey: ''
            },
            anthropic: {
                endpoint: 'https://api.anthropic.com/v1/messages',
                defaultModel: 'claude-4-sonnet',
                defaultApiKey: ''
            },
            google: {
                endpoint: 'https://generativelanguage.googleapis.com/v1/models/',
                defaultModel: 'gemini-3.0-flash',
                defaultApiKey: ''
            }
        };

        // 处理自定义服务商
        if (provider === 'custom' && customSettings) {
            return {
                endpoint: customSettings.endpoint || '',
                defaultModel: customSettings.model || 'custom',
                defaultApiKey: ''
            };
        }

        // 获取基础配置
        const config = baseConfigs[provider] || baseConfigs.deepseek;
        
        // 对于Google模型，需要将模型名称添加到endpoint中
        if (provider === 'google') {
            const modelName = model || config.defaultModel;
            config.endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;
        }
        
        return config;
    }

    // 准备API请求数据格式
    static prepareRequestData(provider, model, messages, temperature = 0.7, maxTokens = 8192) {
        const config = this.getProviderConfig(provider, model);
        
        if (provider === 'google') {
            // Google Gemini 格式
            return {
                contents: messages.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: maxTokens
                }
            };
        } else if (provider === 'anthropic') {
            // Anthropic Claude 格式
            return {
                model: config.defaultModel,
                messages: messages,
                temperature: temperature,
                max_tokens: maxTokens
            };
        } else {
            // OpenAI、DeepSeek 和自定义格式
            return {
                model: config.defaultModel,
                messages: messages,
                temperature: temperature,
                max_tokens: maxTokens
            };
        }
    }

    // 准备请求头
    static prepareRequestHeaders(provider, apiKey) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (provider === 'google') {
            // Google API密钥作为查询参数，不需要在请求头中
            return headers;
        } else if (provider === 'anthropic') {
            // Anthropic使用x-api-key头
            headers['x-api-key'] = apiKey;
            headers['anthropic-version'] = '2023-06-01';
        } else {
            // OpenAI、DeepSeek 和自定义使用Authorization头
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        return headers;
    }

    // 处理API响应
    static processApiResponse(provider, responseData) {
        if (provider === 'google') {
            // Google Gemini 格式
            return responseData.candidates[0].content.parts[0].text;
        } else if (provider === 'anthropic') {
            // Anthropic Claude 格式
            return responseData.content[0].text;
        } else {
            // OpenAI、DeepSeek 和自定义格式
            return responseData.choices[0].message.content;
        }
    }

    // 构建完整的请求配置
    static buildRequestConfig(provider, model, messages, apiKey, customSettings = null, options = {}) {
        const { temperature = 0.7, maxTokens = 8192 } = options;
        
        // 获取配置
        const config = this.getProviderConfig(provider, model, customSettings);
        
        // 准备请求数据
        const requestData = this.prepareRequestData(provider, model, messages, temperature, maxTokens);
        
        // 准备请求头
        const headers = this.prepareRequestHeaders(provider, apiKey);
        
        // 构建请求配置
        const requestConfig = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        };
        
        // 处理Google的API密钥（作为查询参数）
        let endpoint = config.endpoint;
        if (provider === 'google' && apiKey) {
            endpoint += `?key=${apiKey}`;
        }
        
        return {
            endpoint,
            requestConfig
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProviderConfig;
}