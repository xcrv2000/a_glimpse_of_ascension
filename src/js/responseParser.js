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
            console.error('原始内容:', content);
            
            // 如果JSON解析失败，尝试解析简单格式
            try {
                return this.parseSimpleFormat(content);
            } catch (simpleError) {
                console.error('解析简单格式错误:', simpleError);
                return [];
            }
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
                    } else {
                        // 匹配时间设置格式: 当前时间：1925-12-26 00:00:00
                        const timeMatch = line.match(/^当前时间：(.+)$/);
                        if (timeMatch) {
                            const [, value] = timeMatch;
                            requests.push({
                                action: 'update',
                                path: 'metadata.currentTime',
                                value: value.trim()
                            });
                        } else {
                            // 匹配事件操作格式: 注册事件：{...}
                            const eventRegisterMatch = line.match(/^注册事件：(.+)$/);
                            if (eventRegisterMatch) {
                                try {
                                    const eventData = JSON.parse(eventRegisterMatch[1]);
                                    requests.push({
                                        action: 'registerEvent',
                                        value: eventData
                                    });
                                } catch (e) {
                                    console.error('解析事件数据错误:', e);
                                }
                            } else {
                                // 匹配事件更新格式: 更新事件：{...}
                                const eventUpdateMatch = line.match(/^更新事件：(.+)$/);
                                if (eventUpdateMatch) {
                                    try {
                                        const eventData = JSON.parse(eventUpdateMatch[1]);
                                        requests.push({
                                            action: 'updateEvent',
                                            value: eventData
                                        });
                                    } catch (e) {
                                        console.error('解析事件数据错误:', e);
                                    }
                                } else {
                                    // 匹配事件删除格式: 删除事件：事件名称
                                    const eventDeleteMatch = line.match(/^删除事件：(.+)$/);
                                    if (eventDeleteMatch) {
                                        const [, eventName] = eventDeleteMatch;
                                        requests.push({
                                            action: 'deleteEvent',
                                            value: eventName.trim()
                                        });
                                    } else {
                                        // 匹配伏笔操作格式: 添加伏笔：{...}
                                        const foreshadowingAddMatch = line.match(/^添加伏笔：(.+)$/);
                                        if (foreshadowingAddMatch) {
                                            try {
                                                const foreshadowingData = JSON.parse(foreshadowingAddMatch[1]);
                                                requests.push({
                                                    action: 'addForeshadowing',
                                                    value: foreshadowingData
                                                });
                                            } catch (e) {
                                                console.error('解析伏笔数据错误:', e);
                                            }
                                        } else {
                                            // 匹配伏笔更新格式: 更新伏笔：{...}
                                            const foreshadowingUpdateMatch = line.match(/^更新伏笔：(.+)$/);
                                            if (foreshadowingUpdateMatch) {
                                                try {
                                                    const foreshadowingData = JSON.parse(foreshadowingUpdateMatch[1]);
                                                    requests.push({
                                                        action: 'updateForeshadowing',
                                                        value: foreshadowingData
                                                    });
                                                } catch (e) {
                                                    console.error('解析伏笔数据错误:', e);
                                                }
                                            } else {
                                                // 匹配伏笔删除格式: 删除伏笔：伏笔名称
                                                const foreshadowingDeleteMatch = line.match(/^删除伏笔：(.+)$/);
                                                if (foreshadowingDeleteMatch) {
                                                    const [, foreshadowingName] = foreshadowingDeleteMatch;
                                                    requests.push({
                                                        action: 'removeForeshadowing',
                                                        value: foreshadowingName.trim()
                                                    });
                                                } else {
                                                    // 匹配成就完成格式: 完成成就：成就名称
                                                    const achievementCompleteMatch = line.match(/^完成成就：(.+)$/);
                                                    if (achievementCompleteMatch) {
                                                        const [, achievementName] = achievementCompleteMatch;
                                                        requests.push({
                                                            action: 'completeAchievement',
                                                            value: achievementName.trim()
                                                        });
                                                    } else {
                                                        // 匹配成就显示格式: 显示成就：成就名称
                                                        const achievementShowMatch = line.match(/^显示成就：(.+)$/);
                                                        if (achievementShowMatch) {
                                                            const [, achievementName] = achievementShowMatch;
                                                            requests.push({
                                                                action: 'showAchievement',
                                                                value: achievementName.trim()
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
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
        
        // 检查事件操作
        if (request.action === 'registerEvent' || request.action === 'updateEvent') {
            return this.validateEventRequest(request);
        } else if (request.action === 'deleteEvent') {
            return this.validateDeleteEventRequest(request);
        } else if (request.action === 'addForeshadowing' || request.action === 'updateForeshadowing') {
            return this.validateForeshadowingRequest(request);
        } else if (request.action === 'removeForeshadowing') {
            return this.validateRemoveForeshadowingRequest(request);
        } else if (request.action === 'completeAchievement' || request.action === 'showAchievement') {
            // 验证成就操作
            if (!request.value || typeof request.value !== 'string') {
                return { valid: false, error: '成就操作必须指定成就名称' };
            }
            return { valid: true };
        } else if (request.action === 'update') {
            // 只允许特定的路径
            const allowedPaths = [
                'narrative.storyBeatOperation',
                'narrative.depthLevel',
                'metadata.currentTime'
            ];
            
            if (!allowedPaths.includes(request.path)) {
                return { valid: false, error: '只允许更新节拍操作、景深等级或时间设置' };
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
            } else if (request.path === 'metadata.currentTime') {
                // 验证时间格式 YYYY-MM-DD HH:mm:ss
                const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
                if (!timeRegex.test(request.value)) {
                    return { valid: false, error: '时间格式必须为 YYYY-MM-DD HH:mm:ss' };
                }
            }
        } else {
            return { valid: false, error: '未知的操作类型' };
        }
        
        return { valid: true };
    }

    // 验证事件请求
    static validateEventRequest(request) {
        const eventData = request.value;
        
        if (!eventData || typeof eventData !== 'object') {
            return { valid: false, error: '事件数据格式无效' };
        }
        
        // 检查必需字段
        if (!eventData.name || typeof eventData.name !== 'string') {
            return { valid: false, error: '事件必须包含名称' };
        }
        
        if (!eventData.description || typeof eventData.description !== 'string') {
            return { valid: false, error: '事件必须包含描述' };
        }
        
        if (!eventData.startTime || typeof eventData.startTime !== 'string') {
            return { valid: false, error: '事件必须包含开始时间' };
        }
        
        if (!eventData.expectedEndTime || typeof eventData.expectedEndTime !== 'string') {
            return { valid: false, error: '事件必须包含预期结束时间' };
        }
        
        // 验证时间格式
        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(eventData.startTime)) {
            return { valid: false, error: '开始时间格式必须为 YYYY-MM-DD HH:mm:ss' };
        }
        
        if (!timeRegex.test(eventData.expectedEndTime)) {
            return { valid: false, error: '预期结束时间格式必须为 YYYY-MM-DD HH:mm:ss' };
        }
        
        // 验证状态
        if (eventData.status && !['foreground', 'background'].includes(eventData.status)) {
            return { valid: false, error: '事件状态必须是 foreground 或 background' };
        }
        
        // 验证重要程度
        if (eventData.importance && (isNaN(eventData.importance) || eventData.importance < 1 || eventData.importance > 5)) {
            return { valid: false, error: '事件重要程度必须是 1 到 5 之间的数字' };
        }
        
        // 验证参与角色
        if (eventData.participants && !Array.isArray(eventData.participants)) {
            return { valid: false, error: '参与角色必须是数组格式' };
        }
        
        return { valid: true };
    }

    // 验证删除事件请求
    static validateDeleteEventRequest(request) {
        if (!request.value || typeof request.value !== 'string') {
            return { valid: false, error: '删除事件必须指定事件名称' };
        }
        
        return { valid: true };
    }

    // 验证伏笔请求
    static validateForeshadowingRequest(request) {
        const foreshadowingData = request.value;
        
        if (!foreshadowingData || typeof foreshadowingData !== 'object') {
            return { valid: false, error: '伏笔数据格式无效' };
        }
        
        // 检查必需字段
        if (!foreshadowingData.name || typeof foreshadowingData.name !== 'string') {
            return { valid: false, error: '伏笔必须包含名称' };
        }
        
        if (!foreshadowingData.description || typeof foreshadowingData.description !== 'string') {
            return { valid: false, error: '伏笔必须包含描述' };
        }
        
        if (!foreshadowingData.occurrenceTime || typeof foreshadowingData.occurrenceTime !== 'string') {
            return { valid: false, error: '伏笔必须包含发生时间' };
        }
        
        // 验证时间格式
        const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!timeRegex.test(foreshadowingData.occurrenceTime)) {
            return { valid: false, error: '发生时间格式必须为 YYYY-MM-DD HH:mm:ss' };
        }
        
        // 验证重要程度
        if (foreshadowingData.importance && (isNaN(foreshadowingData.importance) || foreshadowingData.importance < 1 || foreshadowingData.importance > 5)) {
            return { valid: false, error: '伏笔重要程度必须是 1 到 5 之间的数字' };
        }
        
        return { valid: true };
    }

    // 验证删除伏笔请求
    static validateRemoveForeshadowingRequest(request) {
        if (!request.value || typeof request.value !== 'string') {
            return { valid: false, error: '删除伏笔必须指定伏笔名称' };
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
                if (request.action === 'update' && request.path === 'narrative.storyBeatOperation') {
                    hasBeatOperation = true;
                }
                
                // 检查是否包含景深等级
                if (request.action === 'update' && request.path === 'narrative.depthLevel') {
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
当前时间：1925-12-26 00:00:00
注册事件：{"name":"侦探查案","description":"侦探去调查神秘案件","startTime":"1925-12-26 00:00:00","expectedEndTime":"1925-12-29 00:00:00","status":"background","importance":3,"participants":["侦探"]}
===GAME_DATA_END===

或者：

===GAME_DATA_START===
节拍操作：维持
当前景深等级：2
当前时间：1925-12-26 08:30:00
添加伏笔：{"name":"神秘符号","description":"在森林中发现的奇怪符号","occurrenceTime":"1925-12-26 08:30:00","importance":4,"meta":{"location":"森林","type":"符号"}}
===GAME_DATA_END===

或者：

===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-29 00:00:00
删除伏笔：神秘符号
===GAME_DATA_END===

或者：

===GAME_DATA_START===
节拍操作：推进
当前景深等级：3
当前时间：1925-12-30 00:00:00
完成成就：霞之伟业
显示成就：霞中车
===GAME_DATA_END===

注意：每次响应都必须包含节拍操作和景深等级，可以选择性包含时间设置、事件操作、伏笔操作和成就操作。`;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseParser;
}