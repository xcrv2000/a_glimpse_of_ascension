// 响应解析模块
class ResponseParser {
    // 解析AI响应
    static parseResponse(response) {
        try {
            if (!response || typeof response !== 'string') {
                throw new Error('无效的响应格式');
            }

            console.log('开始解析AI响应');
            
            // 提取故事部分和数据请求部分
            const { story, dataRequests } = this.extractParts(response);
            
            console.log('解析完成 - 故事部分:', story);
            console.log('解析完成 - 数据请求部分:', dataRequests);
            
            return {
                story,
                dataRequests,
                success: true
            };
        } catch (error) {
            console.error('解析响应错误:', error);
            return {
                story: response,
                dataRequests: [],
                success: false,
                error: error.message
            };
        }
    }

    // 提取响应中的不同部分
    static extractParts(response) {
        // 定义数据请求的开始和结束标记
        const dataRequestStart = /===GAME_DATA_START===/i;
        const dataRequestEnd = /===GAME_DATA_END===/i;
        
        // 查找数据请求部分
        const startMatch = response.match(dataRequestStart);
        const endMatch = response.match(dataRequestEnd);
        
        let story = response;
        let dataRequests = [];
        
        if (startMatch) {
            // 提取故事部分（数据请求之前的内容）
            story = response.substring(0, startMatch.index).trim();
            
            // 如果找到了结束标记，提取并解析数据请求部分
            if (endMatch && endMatch.index > startMatch.index) {
                const dataRequestContent = response.substring(
                    startMatch.index + startMatch[0].length,
                    endMatch.index
                ).trim();
                
                // 解析数据请求内容
                dataRequests = this.parseDataRequests(dataRequestContent);
            }
        }
        
        return { story, dataRequests };
    }

    // 解析数据请求内容
    static parseDataRequests(content) {
        try {
            // 尝试直接解析为JSON
            const requests = JSON.parse(content);
            
            // 确保返回的是数组
            return Array.isArray(requests) ? requests : [requests];
        } catch (error) {
            console.error('解析数据请求JSON错误:', error);
            
            // 如果JSON解析失败，尝试解析简单格式
            return this.parseSimpleFormat(content);
        }
    }

    // 解析简单格式的数据请求
    static parseSimpleFormat(content) {
        try {
            const requests = [];
            const lines = content.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                
                // 匹配节拍操作格式: 节拍操作：推进
                const beatOperationMatch = line.match(/^节拍操作：(.+)$/);
                if (beatOperationMatch) {
                    const [, operation] = beatOperationMatch;
                    requests.push({
                        action: 'update',
                        path: 'narrative.storyBeatOperation',
                        value: operation.trim()
                    });
                } else {
                    // 匹配景深等级格式: 当前景深等级：2
                    const depthMatch = line.match(/^当前景深等级：(.+)$/);
                    if (depthMatch) {
                        const [, value] = depthMatch;
                        requests.push({
                            action: 'update',
                            path: 'narrative.depthLevel',
                            value: value.trim()
                        });
                    }
                }
            });
            
            return requests;
        } catch (error) {
            console.error('解析简单格式错误:', error);
            return [];
        }
    }

    // 解析值的类型
    static parseValue(value) {
        // 确保所有数据都以字符串形式保留
        return String(value);
    }

    // 验证数据请求格式
    static validateRequest(request) {
        if (!request || typeof request !== 'object') {
            return { valid: false, error: '无效的请求格式' };
        }
        
        // 只允许update操作
        if (request.action !== 'update') {
            return { valid: false, error: '只允许update操作' };
        }
        
        // 只允许特定的路径
        const allowedPaths = [
            'narrative.storyBeatOperation',
            'narrative.depthLevel'
        ];
        
        if (!allowedPaths.includes(request.path)) {
            return { valid: false, error: '只允许更新节拍操作或景深等级' };
        }
        
        // 对于节拍操作，只允许特定的值
        if (request.path === 'narrative.storyBeatOperation') {
            const allowedOperations = [
                '推进', '推进到下一节拍',
                '维持', '维持在当前节拍'
            ];
            
            if (!allowedOperations.includes(request.value)) {
                return { valid: false, error: '只允许推进节拍或维持节拍操作' };
            }
        }
        
        return { valid: true };
    }

    // 批量验证数据请求
    static validateRequests(requests) {
        const validatedRequests = [];
        const errors = [];
        
        // 检查是否包含节拍操作和景深等级
        let hasBeatOperation = false;
        let hasDepthLevel = false;
        
        requests.forEach((request, index) => {
            const validation = this.validateRequest(request);
            if (validation.valid) {
                validatedRequests.push(request);
                
                // 检查是否包含节拍操作
                if (request.path === 'narrative.storyBeatOperation') {
                    hasBeatOperation = true;
                }
                
                // 检查是否包含景深等级
                if (request.path === 'narrative.depthLevel') {
                    hasDepthLevel = true;
                }
            } else {
                errors.push({
                    index,
                    error: validation.error,
                    request
                });
            }
        });
        
        // 确保每次响应都包含节拍操作和景深等级
        if (!hasBeatOperation) {
            errors.push({
                index: -1,
                error: '响应必须包含节拍操作',
                request: null
            });
        }
        
        if (!hasDepthLevel) {
            errors.push({
                index: -1,
                error: '响应必须包含景深等级',
                request: null
            });
        }
        
        return {
            validRequests: validatedRequests,
            errors
        };
    }

    // 生成示例数据请求格式
    static getExampleFormat() {
        return `===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
===GAME_DATA_END===

或者：

===GAME_DATA_START===
节拍操作：维持
当前景深等级：2
===GAME_DATA_END===

注意：每次响应都必须包含节拍操作和景深等级。`;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseParser;
}
