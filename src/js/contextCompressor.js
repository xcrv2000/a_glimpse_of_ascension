// 上下文压缩器模块
class ContextCompressor {
    // 未压缩消息数阈值
    static get UNCOMPRESSED_MESSAGE_THRESHOLD() {
        return 24; // 当未压缩消息数超过24条时进行压缩，充分利用更大的上下文窗口
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
    static async compressContext(uncompressedStory, apiKey) {
        if (uncompressedStory.length === 0) {
            console.log('没有需要压缩的故事内容');
            return null;
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
        const requestData = {
            model: 'deepseek-chat',
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
        
        try {
            // 发送请求到DeepSeek API
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || ''}`);
            }
            
            const responseData = await response.json();
            const compressedSummary = responseData.choices[0].message.content;
            
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