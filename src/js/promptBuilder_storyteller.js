// 提示词构建器模块 - 故事讲述者
class PromptBuilder_Storyteller {
    // 加载和处理提示词文件
    static async loadPrompts() {
        // 使用PromptManager加载提示词
        return await PromptManager.loadPrompts('full');
    }
    
    // 加载压缩的上下文
    static async loadCompressedContext() {
        try {
            // 尝试从localStorage加载
            const compressedContextStr = localStorage.getItem('compressedContext');
            if (compressedContextStr) {
                const compressedContext = JSON.parse(compressedContextStr);
                console.log('成功从localStorage加载压缩上下文，压缩消息数:', compressedContext.length);
                return compressedContext;
            }
            
            // 尝试从文件加载
            try {
                const basePath = window.location.pathname.includes('src') ? '' : 'src';
                const contextPath = `${basePath}/data/compressed_context.json`;
                const response = await fetch(contextPath);
                if (response.ok) {
                    const compressedContext = await response.json();
                    console.log('成功从文件加载压缩上下文，压缩消息数:', compressedContext.length);
                    return compressedContext;
                }
            } catch (error) {
                console.log('未找到压缩上下文文件');
            }
            
            return [];
        } catch (error) {
            console.error('加载压缩上下文失败:', error);
            return [];
        }
    }
    
    // 拼装完整的系统提示词
    static buildSystemPrompt(systemPrompt, loreContent, dataContent) {
        // 按照顺序拼装提示词：prompt.json + lore.json + data.json
        let fullSystemPrompt = systemPrompt.trim();
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
        
        // 尝试解析数据内容，提取当前时间
        try {
            const data = JSON.parse(dataContent);
            if (data.currentTime) {
                fullSystemPrompt += "\n\n上次回复的剧情时间: " + data.currentTime;
            }
        } catch (error) {
            console.warn('解析数据内容错误，无法提取当前时间:', error);
        }
        
        return fullSystemPrompt;
    }
    


    // 准备API请求数据 - 第一阶段
    static prepareRequestData(apiKey, userMessage, compressedStory, uncompressedStory, latestUserMessage, aiProvider = 'deepseek', aiModel = null, customSettings = null) {
        // 加载提示词
        return this.loadPrompts().then(prompts => {
            // 从localStorage获取游戏数据，提取世界状态简报
            let worldStatusBrief = '';
            try {
                const localStorageData = localStorage.getItem('gameData');
                if (localStorageData) {
                    const gameData = JSON.parse(localStorageData);
                    if (gameData.worldStatusBrief && typeof gameData.worldStatusBrief === 'string') {
                        worldStatusBrief = gameData.worldStatusBrief;
                    }
                }
            } catch (error) {
                console.error('读取世界状态简报错误:', error);
            }
            
            // 拼装系统提示词
            let fullSystemPrompt = this.buildSystemPrompt(prompts.systemPrompt, prompts.loreContent, prompts.dataContent);
            
            // 如果有世界状态简报，添加到系统提示词中
            if (worldStatusBrief && worldStatusBrief.trim()) {
                fullSystemPrompt += '\n\n===世界状态简报===';
                fullSystemPrompt += '\n\n' + worldStatusBrief.trim();
                fullSystemPrompt += '\n\n===世界状态简报结束===';
            }
            
            // 准备请求数据，确保格式正确
            const messages = [];
            
            // 添加系统提示，确保不为空
            if (fullSystemPrompt && typeof fullSystemPrompt === 'string' && fullSystemPrompt.trim()) {
                messages.push({ role: 'system', content: fullSystemPrompt });
            }
            
            // 添加压缩故事
            if (compressedStory && compressedStory.length > 0) {
                messages.push({
                    role: 'system',
                    content: '===上文摘要部分开始===\n\ncompressed_context'
                });
                compressedStory.forEach(compressedMsg => {
                    if (compressedMsg && compressedMsg.content && typeof compressedMsg.content === 'string') {
                        messages.push({
                            role: compressedMsg.role || 'assistant',
                            content: compressedMsg.content.trim() + '\n'
                        });
                    }
                });
                messages.push({
                    role: 'system',
                    content: '===上文摘要部分结束==='
                });
            }
            
            // 添加未压缩故事（实时故事）
            if (uncompressedStory && uncompressedStory.length > 0) {
                messages.push({
                    role: 'system',
                    content: '===故事部分开始===\n\nuncompressed_context'
                });
                // 排除刚刚添加的用户消息，因为它会作为单独的消息添加
                const storyToSend = uncompressedStory.slice(0, -1);
                storyToSend.forEach(msg => {
                    if (msg && msg.role && msg.content && typeof msg.content === 'string') {
                        messages.push({
                            role: msg.role,
                            content: msg.content.trim()
                        });
                    }
                });
                messages.push({
                    role: 'system',
                    content: '===故事部分结束==='
                });
            }
            
            // 添加最新用户消息，确保不为空
            if (userMessage && typeof userMessage === 'string' && userMessage.trim()) {
                messages.push({
                    role: 'system',
                    content: '===用户输入开始===\n\nuser input'
                });
                messages.push({ role: 'user', content: userMessage.trim() });
                messages.push({
                    role: 'system',
                    content: '===用户输入结束===\n\n请以故事讲述者的身份开始渲染故事，参考博尔赫斯、卡夫卡和钱德勒的文风。注意不要在故事正文中出现底层的游戏数据。'
                });
            }
            
            // 获取服务商配置
            const providerConfig = ProviderConfig.getProviderConfig(aiProvider, aiModel, customSettings);
            
            // 构建请求配置
            const { endpoint, requestConfig } = ProviderConfig.buildRequestConfig(
                aiProvider,
                aiModel,
                messages,
                apiKey,
                customSettings,
                { temperature: 0.7, maxTokens: 8192 }
            );
            
            // 调试日志：输出发送给AI的完整请求数据
            console.log(`发送给${aiProvider} API的数据（故事讲述者）:`, JSON.stringify(requestConfig.body, null, 2));
            console.log('API调用上下文：系统提示词长度:', (fullSystemPrompt || '').length, '压缩故事数:', compressedStory.length, '未压缩故事数:', uncompressedStory.length, '世界状态简报长度:', (worldStatusBrief || '').length);
            
            return {
                requestData: JSON.parse(requestConfig.body),
                apiKey,
                aiProvider,
                aiModel,
                providerConfig,
                endpoint,
                requestConfig
            };
        });
    }
    
    // 发送API请求
    static async sendApiRequest(requestData, apiKey, aiProvider = 'deepseek', aiModel = null, providerConfig = null, customSettings = null) {
        // 获取服务商配置
        if (!providerConfig) {
            providerConfig = ProviderConfig.getProviderConfig(aiProvider, aiModel, customSettings);
        }
        
        // 检查是否有API密钥
        if (!apiKey) {
            throw new Error('请在设置页面配置API密钥');
        }
        
        // 准备消息格式
        let messages = requestData.messages || requestData.contents;
        if (requestData.contents) {
            // 转换Google格式到标准消息格式
            messages = requestData.contents.map(item => ({
                role: item.role,
                content: item.parts[0].text
            }));
        }
        
        // 构建请求配置
        const { endpoint, requestConfig } = ProviderConfig.buildRequestConfig(
            aiProvider,
            aiModel,
            messages,
            apiKey,
            customSettings,
            { temperature: 0.7, maxTokens: 8192 }
        );
        
        // 发送请求到API
        const response = await fetch(endpoint, requestConfig);
        
        // 调试日志：输出API响应状态
        console.log(`${aiProvider} API响应状态:`, response.status, response.statusText);
        
        // 获取响应数据，无论成功或失败
        let responseData;
        try {
            responseData = await response.json();
            console.log(`${aiProvider} API响应数据:`, JSON.stringify(responseData, null, 2));
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
                throw new Error(`API余额不足，请在设置页面配置您自己的${aiProvider} API密钥: ${errorMessage}`);
            }
            
            throw new Error(errorMessage);
        }
        
        // 提取响应内容，根据不同服务商的格式
        const content = ProviderConfig.processApiResponse(aiProvider, responseData);
        
        // 解析响应，只返回故事内容
        const parsedResult = this.parseResponse(content);
        
        // 返回完整的响应数据，包括原始内容和解析后的故事
        return {
            ...parsedResult,
            fullResponse: content
        };
    }
    
    // 解析API响应，只返回故事内容
    static parseResponse(content) {
        try {
            const story = content.trim();
            console.log('解析后的故事:', story);
            
            return {
                story
            };
        } catch (error) {
            console.error('解析API响应失败:', error);
            return {
                story: content
            };
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptBuilder_Storyteller;
}