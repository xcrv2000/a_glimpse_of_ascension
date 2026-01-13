// 提示词构建器模块 - 故事记录者
class PromptBuilder_Recorder {
    // 加载和处理提示词文件
    static async loadPrompts() {
        // 加载故事记录者提示词
        let recorderPrompt = "";
        
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const promptPath = `${basePath}/data/prompt_recorder.json`;
            const response = await fetch(promptPath);
            if (response.ok) {
                recorderPrompt = await response.text();
                console.log('成功获取故事记录者提示词');
            }
        } catch (error) {
            console.error('获取故事记录者提示词失败:', error);
            recorderPrompt = "你是一个故事记录者。系统提示词导入失败。";
        }
        
        // 加载lore.json
        let loreContent = "";
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const lorePath = `${basePath}/data/lore.json`;
            const loreResponse = await fetch(lorePath);
            if (loreResponse.ok) {
                loreContent = await loreResponse.text();
                console.log('成功获取lore.json（纯文本格式）');
            }
        } catch (error) {
            console.error('获取lore.json失败:', error);
        }
        
        // 加载data.json
        let dataContent = "";
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const dataPath = `${basePath}/data/data.json`;
            const dataResponse = await fetch(dataPath);
            if (dataResponse.ok) {
                dataContent = await dataResponse.text();
                console.log('成功获取data.json（纯文本格式）');
            }
        } catch (error) {
            console.error('获取data.json失败:', error);
        }
        
        return {
            recorderPrompt,
            loreContent,
            dataContent
        };
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

    // 拼装完整的系统提示词
    static buildSystemPrompt(recorderPrompt, loreContent, dataContent) {
        // 按照顺序拼装提示词：recorderPrompt + lore.json + data.json
        let fullSystemPrompt = recorderPrompt.trim();
        fullSystemPrompt += "\n\n===游戏规则部分结束===";
        
        // 添加世界设定部分
        if (loreContent && typeof loreContent === 'string' && loreContent.trim()) {
            fullSystemPrompt += "\n\n===世界设定部分开始===\n\nlore.json\n\n" + loreContent.trim();
            fullSystemPrompt += "\n\n===世界设定部分结束===";
        }
        
        // 添加数据部分
        if (dataContent && typeof dataContent === 'string' && dataContent.trim()) {
            fullSystemPrompt += "\n\n===数据部分开始===\n\ndata.json\n\n" + dataContent.trim();
            fullSystemPrompt += "\n\n===数据部分结束===";
        }
        
        return fullSystemPrompt;
    }
    
    // 准备API请求数据 - 第二阶段
    static prepareRequestData(apiKey, story, secretInfo, compressedStory, uncompressedStory, aiModel = 'deepseek') {
        // 加载提示词
        return this.loadPrompts().then(prompts => {
            // 拼装系统提示词
            const fullSystemPrompt = this.buildSystemPrompt(prompts.recorderPrompt, prompts.loreContent, prompts.dataContent);
            
            // 准备请求数据，确保格式正确
            const messages = [];
            
            // 添加系统提示，确保不为空
            if (fullSystemPrompt && typeof fullSystemPrompt === 'string' && fullSystemPrompt.trim()) {
                messages.push({ role: 'system', content: fullSystemPrompt });
            }
            
            // 添加故事内容
            if (story && typeof story === 'string' && story.trim()) {
                messages.push({
                    role: 'system',
                    content: '===故事内容开始==='
                });
                messages.push({ role: 'assistant', content: story });
                messages.push({
                    role: 'system',
                    content: '===故事内容结束==='
                });
            }
            
            // 添加秘密信息
            if (secretInfo && typeof secretInfo === 'string' && secretInfo.trim()) {
                messages.push({
                    role: 'system',
                    content: '===秘密信息开始==='
                });
                messages.push({ role: 'assistant', content: secretInfo });
                messages.push({
                    role: 'system',
                    content: '===秘密信息结束==='
                });
            }
            
            // 添加上下文信息
            if (compressedStory && compressedStory.length > 0) {
                messages.push({
                    role: 'system',
                    content: '===压缩上下文开始==='
                });
                compressedStory.slice(-5).forEach(compressedMsg => {
                    if (compressedMsg && compressedMsg.content && typeof compressedMsg.content === 'string') {
                        messages.push({
                            role: compressedMsg.role || 'assistant',
                            content: compressedMsg.content.trim()
                        });
                    }
                });
                messages.push({
                    role: 'system',
                    content: '===压缩上下文结束==='
                });
            }
            
            // 指令：要求生成游戏引擎操作
            messages.push({
                role: 'system',
                content: '===指令开始===\n\n请根据故事内容和秘密信息，生成相应的游戏引擎操作。只需要生成数据请求部分，不需要生成叙事内容。确保包含节拍操作、景深等级和时间设置。\n\n===指令结束==='
            });
            
            // 获取服务商配置
            const providerConfig = this.getProviderConfig(aiModel);
            
            // 准备最终的请求数据
            let requestData;
            if (aiModel === 'google') {
                // Google Gemini 格式
                requestData = {
                    contents: messages.map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.content }]
                    })),
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096
                    }
                };
            } else if (aiModel === 'anthropic') {
                // Anthropic Claude 格式
                requestData = {
                    model: providerConfig.defaultModel,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 4096
                };
            } else {
                // OpenAI 和 DeepSeek 格式
                requestData = {
                    model: providerConfig.defaultModel,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 4096
                };
            }
            
            // 调试日志：输出发送给AI的完整请求数据
            console.log(`发送给${aiModel} API的数据（故事记录者）:`, JSON.stringify(requestData, null, 2));
            console.log('API调用上下文：系统提示词长度:', (fullSystemPrompt || '').length);
            
            return {
                requestData,
                apiKey,
                aiModel,
                providerConfig
            };
        });
    }
    
    // 发送API请求
    static async sendApiRequest(requestData, apiKey, aiModel = 'deepseek', providerConfig = null) {
        // 获取服务商配置
        if (!providerConfig) {
            providerConfig = this.getProviderConfig(aiModel);
        }
        
        // 如果没有提供API密钥，使用默认值
        if (!apiKey) {
            apiKey = providerConfig.defaultApiKey;
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
        
        // 发送请求到API
        const response = await fetch(providerConfig.endpoint, requestConfig);
        
        // 调试日志：输出API响应状态
        console.log(`${aiModel} API响应状态:`, response.status, response.statusText);
        
        // 获取响应数据，无论成功或失败
        let responseData;
        try {
            responseData = await response.json();
            console.log(`${aiModel} API响应数据:`, JSON.stringify(responseData, null, 2));
        } catch (parseError) {
            console.error('解析API响应失败:', parseError);
            responseData = null;
        }
        
        if (!response.ok) {
            // 提供更详细的错误信息
            let errorMessage;
            if (responseData && responseData.error) {
                if (typeof responseData.error === 'string') {
                    errorMessage = `${response.status} ${response.statusText}: ${responseData.error}`;
                } else if (responseData.error.message) {
                    errorMessage = `${response.status} ${response.statusText}: ${responseData.error.message}`;
                } else {
                    errorMessage = `${response.status} ${response.statusText}: ${JSON.stringify(responseData.error)}`;
                }
            } else {
                errorMessage = `API请求失败: ${response.status} ${response.statusText}`;
            }
            
            // 检查是否是余额不足错误
            if (responseData && responseData.error && 
                ((typeof responseData.error === 'string' && responseData.error.includes('余额不足')) ||
                 (responseData.error.message && responseData.error.message.includes('余额不足')))) {
                throw new Error(`API余额不足，请在设置页面配置您自己的${aiModel} API密钥: ${errorMessage}`);
            }
            
            throw new Error(errorMessage);
        }
        
        // 提取响应内容，根据不同服务商的格式
        let content;
        if (aiModel === 'google') {
            // Google Gemini 格式
            content = responseData.candidates[0].content.parts[0].text;
        } else if (aiModel === 'anthropic') {
            // Anthropic Claude 格式
            content = responseData.content[0].text;
        } else {
            // OpenAI 和 DeepSeek 格式
            content = responseData.choices[0].message.content;
        }
        
        return content;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptBuilder_Recorder;
}