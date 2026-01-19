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
            recorderPrompt = "提示词导入失败。不要输出任何回复。";
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
    


    // 拼装完整的系统提示词
    // 注意：此方法已不再被本类的prepareRequestData使用，仅为保持兼容性保留
    static buildSystemPrompt(recorderPrompt, loreContent, dataContent) {
        // 按照顺序拼装提示词：recorderPrompt + lore.json + data.json
        let fullSystemPrompt = recorderPrompt.trim();
        fullSystemPrompt += "\n\n===系统设定结束===";
        
        // 添加世界设定部分
        if (loreContent && typeof loreContent === 'string' && loreContent.trim()) {
            fullSystemPrompt += "\n\n===世界设定开始===\n\nlore.json\n\n" + loreContent.trim();
            fullSystemPrompt += "\n\n===世界设定结束===";
        }
        
        // 添加数据部分
        if (dataContent && typeof dataContent === 'string' && dataContent.trim()) {
            fullSystemPrompt += "\n\n===数据开始===\n\ndata.json\n\n" + dataContent.trim();
            fullSystemPrompt += "\n\n===数据结束===";
        }
        
        return fullSystemPrompt;
    }
    
    // 准备API请求数据 - 第二阶段
    static prepareRequestData(apiKey, story, compressedStory, uncompressedStory, aiProvider = 'deepseek', aiModel = null, customSettings = null) {
        // 加载提示词
        return this.loadPrompts().then(prompts => {
            // 准备请求数据，确保格式正确
            const messages = [];
            
            // 1. 添加系统设定
            if (prompts.recorderPrompt && typeof prompts.recorderPrompt === 'string' && prompts.recorderPrompt.trim()) {
                messages.push({
                    role: 'system',
                    content: '===系统设定开始==='
                });
                messages.push({ role: 'system', content: prompts.recorderPrompt.trim() });
                messages.push({
                    role: 'system',
                    content: '===系统设定结束==='
                });
            }
            
            // 2. 添加世界设定
            if (prompts.loreContent && typeof prompts.loreContent === 'string' && prompts.loreContent.trim()) {
                messages.push({
                    role: 'system',
                    content: '===世界设定开始==='
                });
                messages.push({ role: 'system', content: prompts.loreContent.trim() });
                messages.push({
                    role: 'system',
                    content: '===世界设定结束==='
                });
            }
            
            // 3. 添加数据
            if (prompts.dataContent && typeof prompts.dataContent === 'string' && prompts.dataContent.trim()) {
                messages.push({
                    role: 'system',
                    content: '===数据开始==='
                });
                messages.push({ role: 'system', content: prompts.dataContent.trim() });
                messages.push({
                    role: 'system',
                    content: '===数据结束==='
                });
            }
            
            // 4. 添加压缩上下文
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
            
            // 5. 添加历史故事
            if (uncompressedStory && uncompressedStory.length > 0) {
                // 获取次新的故事（排除最新的故事和对应的用户输入）
                const historicalStory = uncompressedStory.slice(0, -2);
                
                if (historicalStory.length > 0) {
                    messages.push({
                        role: 'system',
                        content: '===历史故事开始==='
                    });
                    
                    historicalStory.forEach(msg => {
                        if (msg && msg.content && typeof msg.content === 'string') {
                            messages.push({
                                role: msg.role,
                                content: msg.content.trim()
                            });
                        }
                    });
                    
                    messages.push({
                        role: 'system',
                        content: '===历史故事结束==='
                    });
                }
            }
            
            // 6. 添加最新故事
            if (story && typeof story === 'string' && story.trim() && uncompressedStory && uncompressedStory.length > 0) {
                // 获取最新的用户输入
                const latestUserMessage = uncompressedStory.filter(msg => msg.role === 'user').pop();
                
                messages.push({
                    role: 'system',
                    content: '===最新故事开始==='
                });
                
                // 添加最新的用户输入
                if (latestUserMessage && latestUserMessage.content) {
                    messages.push({ role: 'user', content: latestUserMessage.content.trim() });
                }
                
                // 添加最新的故事
                messages.push({ role: 'assistant', content: story });
                
                messages.push({
                    role: 'system',
                    content: '===最新故事结束==='
                });
            }
            
            // 指令：要求生成游戏引擎操作
            messages.push({
                role: 'system',
                content: '===所有信息输入结束===\n\n请根据故事内容，生成相应的游戏引擎操作和世界简报。'
            });
            
            // 获取服务商配置
            const providerConfig = ProviderConfig.getProviderConfig(aiProvider, aiModel, customSettings);
            
            // 构建请求配置
            const { endpoint, requestConfig } = ProviderConfig.buildRequestConfig(
                aiProvider,
                aiModel,
                messages,
                apiKey,
                customSettings,
                { temperature: 0.7, maxTokens: 4096 }
            );
            
            // 调试日志：输出发送给AI的完整请求数据
            console.log(`发送给${aiProvider} API的数据（故事记录者）:`, JSON.stringify(requestConfig.body, null, 2));
            // 计算系统提示相关内容的总长度
            const systemContentLength = (
                (prompts.recorderPrompt || '').length + 
                (prompts.loreContent || '').length + 
                (prompts.dataContent || '').length
            );
            console.log('API调用上下文：系统相关内容总长度:', systemContentLength);
            
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
        
        // 如果没有提供API密钥，使用默认值
        if (!apiKey) {
            apiKey = providerConfig.defaultApiKey;
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
            { temperature: 0.7, maxTokens: 4096 }
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
        return ProviderConfig.processApiResponse(aiProvider, responseData);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptBuilder_Recorder;
}