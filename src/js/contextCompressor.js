// 上下文压缩器模块
class ContextCompressor {
    // 未压缩消息数阈值
    static get UNCOMPRESSED_MESSAGE_THRESHOLD() {
        return 24; // 当未压缩消息数超过24条时进行压缩，充分利用更大的上下文窗口
    }
    
    // 获取服务商配置
    static getProviderConfig(aiModel) {
        const configs = {
            deepseek: {
                endpoint: 'https://api.deepseek.com/v1/chat/completions',
                defaultModel: 'deepseek-chat',
                defaultApiKey: 'sk-13cf1d781bca49d49cd15136a4859607'
            },
            openai: {
                endpoint: 'https://api.openai.com/v1/chat/completions',
                defaultModel: 'gpt-4',
                defaultApiKey: ''
            },
            anthropic: {
                endpoint: 'https://api.anthropic.com/v1/messages',
                defaultModel: 'claude-3-opus-20240229',
                defaultApiKey: ''
            },
            google: {
                endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
                defaultModel: 'gemini-pro',
                defaultApiKey: ''
            }
        };
        return configs[aiModel] || configs.deepseek;
    }
    
    // 检查是否需要压缩上下文
    static shouldCompress(uncompressedStory) {
        // 计算未压缩消息数量
        const messageCount = uncompressedStory.length;
        
        console.log(`当前未压缩消息数: ${messageCount}，阈值: ${this.UNCOMPRESSED_MESSAGE_THRESHOLD} 条`);
        
        // 当未压缩消息数超过阈值时需要压缩
        return messageCount >= this.UNCOMPRESSED_MESSAGE_THRESHOLD;
    }
    
    // 压缩上下文
    static async compressContext(uncompressedStory, apiKey, aiModel = 'deepseek') {
        if (uncompressedStory.length === 0) {
            console.log('没有需要压缩的故事内容');
            return null;
        }
        
        // 获取服务商配置
        const providerConfig = this.getProviderConfig(aiModel);
        
        // 如果没有提供API密钥，使用默认值
        if (!apiKey) {
            apiKey = providerConfig.defaultApiKey;
        }
        
        console.log('开始压缩上下文，未压缩消息数:', uncompressedStory.length);
        
        // 准备压缩提示词
        const compressionPrompt = `请将以下对话历史压缩为一个简洁的摘要，保留所有重要信息，包括人物、事件、地点、关键情节和时间点。摘要应该能够作为后续对话的上下文，确保AI助手能够理解整个对话的内容。

对话历史:
${uncompressedStory.map(msg => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`).join('\n')}

摘要要求:
1. 简洁明了，去除冗余信息
2. 保留所有重要的情节发展
3. 保持故事的连贯性
4. 使用第三人称叙述
5. 特别注意提取并保留每件事发生的时间点
6. 长度控制在300字以内`;
        
        // 准备API请求数据
        let requestData;
        if (aiModel === 'google') {
            // Google Gemini 格式
            requestData = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: compressionPrompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 512
                }
            };
        } else if (aiModel === 'anthropic') {
            // Anthropic Claude 格式
            requestData = {
                model: providerConfig.defaultModel,
                messages: [
                    {
                        role: 'user',
                        content: compressionPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 512
            };
        } else {
            // OpenAI 和 DeepSeek 格式
            requestData = {
                model: providerConfig.defaultModel,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的文本摘要助手，擅长将长对话压缩为简洁的摘要。'
                    },
                    {
                        role: 'user',
                        content: compressionPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 512
            };
        }
        
        // 准备请求配置
        const requestConfig = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        };
        
        // 对于Google Gemini，使用不同的认证头
        if (aiModel === 'google') {
            requestConfig.headers = {
                'Content-Type': 'application/json'
            };
            requestConfig.body = JSON.stringify(requestData);
            // Google API密钥作为查询参数
            providerConfig.endpoint += `?key=${apiKey}`;
        }
        
        // 对于Anthropic，使用正确的认证头
        if (aiModel === 'anthropic') {
            requestConfig.headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            };
        }
        
        try {
            // 发送请求到API
            const response = await fetch(providerConfig.endpoint, requestConfig);
            
            if (!response.ok) {
                const errorData = await response.json();
                // 检查是否是余额不足错误
                if (errorData.error && 
                    ((typeof errorData.error === 'string' && errorData.error.includes('余额不足')) ||
                     (errorData.error.message && errorData.error.message.includes('余额不足')))) {
                    throw new Error(`API余额不足，请在设置页面配置您自己的${aiModel} API密钥: ${response.status} ${errorData.error.message || errorData.error}`);
                }
                throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || errorData.error || ''}`);
            }
            
            const responseData = await response.json();
            
            // 提取响应内容，根据不同服务商的格式
            let compressedSummary;
            if (aiModel === 'google') {
                // Google Gemini 格式
                compressedSummary = responseData.candidates[0].content.parts[0].text;
            } else if (aiModel === 'anthropic') {
                // Anthropic Claude 格式
                compressedSummary = responseData.content[0].text;
            } else {
                // OpenAI 和 DeepSeek 格式
                compressedSummary = responseData.choices[0].message.content;
            }
            
            console.log('上下文压缩成功，压缩摘要长度:', compressedSummary.length);
            
            // 创建压缩后的消息对象
            const compressedMessage = {
                role: 'assistant',
                content: compressedSummary,
                compressed: true,
                timestamp: new Date().toISOString()
            };
            
            return compressedMessage;
        } catch (error) {
            console.error('压缩上下文失败:', error);
            throw error;
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextCompressor;
}