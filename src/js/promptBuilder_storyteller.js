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
            if (data.metadata && data.metadata.currentTime) {
                fullSystemPrompt += "\n\n上次回复的剧情时间: " + data.metadata.currentTime;
            }
        } catch (error) {
            console.warn('解析数据内容错误，无法提取当前时间:', error);
        }
        
        return fullSystemPrompt;
    }
    
    // 准备API请求数据 - 第一阶段
    static prepareRequestData(apiKey, userMessage, compressedStory, uncompressedStory, latestUserMessage) {
        // 加载提示词
        return this.loadPrompts().then(prompts => {
            // 拼装系统提示词
            const fullSystemPrompt = this.buildSystemPrompt(prompts.systemPrompt, prompts.loreContent, prompts.dataContent);
            
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
                    content: '===摘要部分开始===\n\ncompressed_context'
                });
                compressedStory.forEach(compressedMsg => {
                    if (compressedMsg && compressedMsg.content && typeof compressedMsg.content === 'string') {
                        messages.push({
                            role: compressedMsg.role || 'assistant',
                            content: compressedMsg.content.trim()
                        });
                    }
                });
                messages.push({
                    role: 'system',
                    content: '===摘要部分结束==='
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
                    content: '===用户输入结束===\n\n请以故事讲述者的身份开始渲染故事。请在叙事结束后添加一段秘密信息，格式为"**秘密信息**：[内容]"。秘密信息将直接发送给故事记录者，用于后续的游戏引擎更新。'
                });
            }
            
            // 准备最终的请求数据
            const requestData = {
                model: 'deepseek-chat',
                messages: messages,
                temperature: 0.7,
                max_tokens: 8192
            };
            
            // 调试日志：输出发送给AI的完整请求数据
            console.log('发送给DeepSeek API的数据（故事讲述者）:', JSON.stringify(requestData, null, 2));
            console.log('API调用上下文：系统提示词长度:', (fullSystemPrompt || '').length, '压缩故事数:', compressedStory.length, '未压缩故事数:', uncompressedStory.length);
            
            return {
                requestData,
                apiKey
            };
        });
    }
    
    // 发送API请求
    static async sendApiRequest(requestData, apiKey) {
        // 发送请求到DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestData)
        });
        
        // 调试日志：输出API响应状态
        console.log('DeepSeek API响应状态:', response.status, response.statusText);
        
        // 获取响应数据，无论成功或失败
        let responseData;
        try {
            responseData = await response.json();
            console.log('DeepSeek API响应数据:', JSON.stringify(responseData, null, 2));
        } catch (parseError) {
            console.error('解析API响应失败:', parseError);
            responseData = null;
        }
        
        if (!response.ok) {
            // 提供更详细的错误信息
            const errorMessage = responseData && responseData.error 
                ? `${response.status} ${response.statusText}: ${responseData.error.message}`
                : `API请求失败: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        const content = responseData.choices[0].message.content;
        
        // 解析响应，提取故事和秘密信息
        return this.parseResponse(content);
    }
    
    // 解析API响应，提取故事和秘密信息
    static parseResponse(content) {
        try {
            // 寻找秘密信息标记
            const secretInfoMatch = content.match(/\*\*秘密信息\*\*：([\s\S]*)$/);
            
            let story = content;
            let secretInfo = '';
            
            if (secretInfoMatch) {
                // 提取故事部分（去掉秘密信息）
                story = content.substring(0, secretInfoMatch.index).trim();
                // 提取秘密信息
                secretInfo = secretInfoMatch[1].trim();
            }
            
            console.log('解析后的故事:', story);
            console.log('解析后的秘密信息:', secretInfo);
            
            return {
                story,
                secretInfo
            };
        } catch (error) {
            console.error('解析API响应失败:', error);
            return {
                story: content,
                secretInfo: ''
            };
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptBuilder_Storyteller;
}