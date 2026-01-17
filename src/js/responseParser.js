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
        // 直接解析整个响应内容
        let story = '';
        let dataRequests = [];
        
        try {
            // 尝试解析数据请求
            const parseResult = this.parseDataRequests(response);
            dataRequests = parseResult.requests;
            story = parseResult.story;
        } catch (error) {
            console.error('解析数据请求错误:', error);
            // 如果解析失败，将整个内容视为故事
            story = response;
            dataRequests = [];
        }
        
        return { story, dataRequests };
    }

    // 解析数据请求内容
    static parseDataRequests(content) {
        try {
            const requests = [];
            const storyLines = [];
            const lines = content.split('\n');
            
            let inJsonBlock = false;
            let currentJsonBuffer = '';
            let currentRequestType = null;
            let jsonOpenBraces = 0;
            
            lines.forEach(line => {
                // 保留原始行（包括空格和换行）用于story
                const originalLine = line;
                
                // 处理数据请求时使用trimmed版本
                const trimmedLine = line.trim();
                
                // 检查是否在JSON块中
                if (inJsonBlock) {
                    // 累加JSON内容
                    currentJsonBuffer += line + '\n';
                    
                    // 统计花括号数量
                    jsonOpenBraces += (line.match(/{/g) || []).length;
                    jsonOpenBraces -= (line.match(/}/g) || []).length;
                    
                    // 如果花括号匹配，说明JSON块结束
                    if (jsonOpenBraces === 0) {
                        try {
                            // 解析完整的JSON
                            const jsonData = JSON.parse(currentJsonBuffer.trim());
                            
                            // 根据请求类型创建请求
                            const actionMap = {
                                '注册事件': 'registerEvent',
                                '更新事件': 'updateEvent',
                                '添加伏笔': 'addForeshadowing',
                                '更新伏笔': 'updateForeshadowing',
                                '注册角色': 'registerCharacter',
                                '更新角色': 'updateCharacter',
                                '添加物品': 'addItem',
                                '添加资产': 'addProperty',
                                '添加知识': 'addKnowledge',
                                '添加地点': 'addLocation',
                                '更新物品': 'updateItem',
                                '更新资产': 'updateProperty',
                                '更新知识': 'updateKnowledge',
                                '更新地点': 'updateLocation'
                            };
                            
                            if (actionMap[currentRequestType]) {
                                requests.push({
                                    action: actionMap[currentRequestType],
                                    value: jsonData
                                });
                            }
                        } catch (e) {
                            console.error(`解析${currentRequestType}数据错误:`, e);
                        }
                        
                        // 重置状态
                        inJsonBlock = false;
                        currentJsonBuffer = '';
                        currentRequestType = null;
                    }
                    return;
                }
                
                if (!trimmedLine) {
                    // 保留空行到story中
                    storyLines.push(originalLine);
                    return;
                }
                
                // 匹配节拍操作格式: 节拍操作：维持节拍 或 维持节拍
                const beatOperationMatch = trimmedLine.match(/^(节拍操作：|)(维持|推进|完结)(节拍|)$/);
                if (beatOperationMatch) {
                    const [, , operation] = beatOperationMatch;
                    let normalizedOperation = operation.trim();
                    requests.push({
                        action: 'update',
                        path: 'narrative.storyBeatOperation',
                        value: normalizedOperation
                    });
                    return;
                }
                
                // 匹配景深等级格式: 当前景深等级：2 或 景深等级：2
                const depthMatch = trimmedLine.match(/^(当前)?景深等级：(.+)$/);
                if (depthMatch) {
                    const [, , value] = depthMatch;
                    requests.push({
                        action: 'update',
                        path: 'narrative.depthLevel',
                        value: value.trim()
                    });
                    return;
                }
                
                // 匹配时间设置格式: 当前时间：1925-12-26 00:00:00
                const timeMatch = trimmedLine.match(/^当前时间：(.+)$/);
                if (timeMatch) {
                    const [, value] = timeMatch;
                    requests.push({
                        action: 'update',
                        path: 'currentTime',
                        value: value.trim()
                    });
                    return;
                }
                
                // 匹配单行请求格式
                
                // 匹配删除事件格式: 删除事件：事件名称
                const eventDeleteMatch = trimmedLine.match(/^删除事件：(.+)$/);
                if (eventDeleteMatch) {
                    const [, eventName] = eventDeleteMatch;
                    requests.push({
                        action: 'deleteEvent',
                        value: eventName.trim()
                    });
                    return;
                }
                
                // 匹配删除伏笔格式: 删除伏笔：伏笔名称
                const foreshadowingDeleteMatch = trimmedLine.match(/^删除伏笔：(.+)$/);
                if (foreshadowingDeleteMatch) {
                    const [, foreshadowingName] = foreshadowingDeleteMatch;
                    requests.push({
                        action: 'removeForeshadowing',
                        value: foreshadowingName.trim()
                    });
                    return;
                }
                
                // 匹配完成成就格式: 完成成就：成就名称
                const achievementCompleteMatch = trimmedLine.match(/^完成成就：(.+)$/);
                if (achievementCompleteMatch) {
                    const [, achievementName] = achievementCompleteMatch;
                    requests.push({
                        action: 'completeAchievement',
                        value: achievementName.trim()
                    });
                    return;
                }
                
                // 匹配显示成就格式: 显示成就：成就名称
                const achievementShowMatch = trimmedLine.match(/^显示成就：(.+)$/);
                if (achievementShowMatch) {
                    const [, achievementName] = achievementShowMatch;
                    requests.push({
                        action: 'showAchievement',
                        value: achievementName.trim()
                    });
                    return;
                }
                
                // 匹配删除角色格式: 删除角色：角色名称
                const characterDeleteMatch = trimmedLine.match(/^删除角色：(.+)$/);
                if (characterDeleteMatch) {
                    const [, characterName] = characterDeleteMatch;
                    requests.push({
                        action: 'deleteCharacter',
                        value: characterName.trim()
                    });
                    return;
                }
                
                // 匹配添加角色做过的事格式: 添加角色做过的事：角色名称，做过的事
                const addCharacterThingDoneMatch = trimmedLine.match(/^添加角色做过的事：(.+)$/);
                if (addCharacterThingDoneMatch) {
                    const [, value] = addCharacterThingDoneMatch;
                    try {
                        // 解析格式：角色名称，做过的事
                        const parts = value.split('，');
                        if (parts.length >= 2) {
                            const name = parts[0].trim();
                            const thingDone = parts.slice(1).join('，').trim();
                            requests.push({
                                action: 'addCharacterThingDone',
                                value: {
                                    name,
                                    thingDone
                                }
                            });
                        }
                    } catch (e) {
                        console.error('解析添加角色做过的事错误:', e);
                    }
                    return;
                }
                
                // 匹配移除物品/资产/知识/地点格式: 移除物品：物品名称
            const removeMatch = trimmedLine.match(/^移除(物品|资产|知识|地点)：(.+)$/);
            if (removeMatch) {
                const [, type, name] = removeMatch;
                const actionMap = {
                    '物品': 'removeItem',
                    '资产': 'removeProperty',
                    '知识': 'removeKnowledge',
                    '地点': 'removeLocation'
                };
                requests.push({
                    action: actionMap[type],
                    value: name.trim()
                });
                return;
            }
                
                // 匹配JSON块起始的请求类型
                const jsonRequestMatch = trimmedLine.match(/^(注册事件|更新事件|添加伏笔|更新伏笔|注册角色|更新角色|添加物品|添加资产|添加知识|添加地点|更新物品|更新资产|更新知识|更新地点)：\{/);
                if (jsonRequestMatch) {
                    // 进入JSON块模式
                    inJsonBlock = true;
                    currentRequestType = jsonRequestMatch[1];
                    currentJsonBuffer = trimmedLine.replace(jsonRequestMatch[0], '{') + '\n';
                    
                    // 初始化花括号计数
                    jsonOpenBraces = 1; // 已经有一个开放的花括号
                    return;
                }
                
                // 如果不是数据请求行，将其添加到story中
                storyLines.push(originalLine);
            });
            
            // 将storyLines重新组合成完整的story字符串，保留原始换行
            const story = storyLines.join('\n');
            
            return { requests, story };
        } catch (error) {
            console.error('解析数据请求错误:', error);
            return { requests: [], story: content };
        }
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
        } else if (request.action === 'registerCharacter' || request.action === 'updateCharacter') {
            return this.validateCharacterRequest(request);
        } else if (request.action === 'deleteCharacter') {
            return this.validateDeleteCharacterRequest(request);
        } else if (request.action === 'addCharacterThingDone') {
            return this.validateAddCharacterThingDoneRequest(request);
        } else if (request.action === 'addItem' || request.action === 'addProperty' || request.action === 'addKnowledge' || request.action === 'addLocation') {
            return this.validateAssetAddRequest(request);
        } else if (request.action === 'removeItem' || request.action === 'removeProperty' || request.action === 'removeKnowledge' || request.action === 'removeLocation') {
            return this.validateAssetRemoveRequest(request);
        } else if (request.action === 'updateItem' || request.action === 'updateProperty' || request.action === 'updateKnowledge' || request.action === 'updateLocation') {
            return this.validateAssetAddRequest(request);
        } else if (request.action === 'update') {
            // 只允许特定的路径
            const allowedPaths = [
                'narrative.storyBeatOperation',
                'narrative.depthLevel',
                'currentTime'
            ];
            
            if (!allowedPaths.includes(request.path)) {
                return { valid: false, error: '只允许更新节拍操作、景深等级或时间设置' };
            }
            
            // 对于节拍操作，只允许特定的值
            if (request.path === 'narrative.storyBeatOperation') {
                const allowedOperations = [
                    '推进', '维持', '完结'
                ];
                
                if (!allowedOperations.includes(request.value)) {
                    return { valid: false, error: '只允许推进、维持或完结操作' };
                }
            }
            
            return { valid: true };
        } else {
            return { valid: false, error: '不支持的操作类型' };
        }
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
            return { valid: false, error: '事件必须包含预计结束时间' };
        }
        
        // 检查可选字段
        if (eventData.importance !== undefined && typeof eventData.importance !== 'number') {
            return { valid: false, error: '事件重要性必须是数字' };
        }
        
        if (eventData.status !== undefined && typeof eventData.status !== 'string') {
            return { valid: false, error: '事件状态必须是字符串' };
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
        
        // 检查可选字段
        if (foreshadowingData.importance !== undefined && typeof foreshadowingData.importance !== 'number') {
            return { valid: false, error: '伏笔重要性必须是数字' };
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

    // 验证角色请求
    static validateCharacterRequest(request) {
        const characterData = request.value;
        
        if (!characterData || typeof characterData !== 'object') {
            return { valid: false, error: '角色数据格式无效' };
        }
        
        // 检查必需字段
        if (!characterData.name || typeof characterData.name !== 'string') {
            return { valid: false, error: '角色必须包含名称' };
        }
        
        if (!characterData.description || typeof characterData.description !== 'string') {
            return { valid: false, error: '角色必须包含描述' };
        }
        
        // 检查可选字段
        if (characterData.importance !== undefined && typeof characterData.importance !== 'number') {
            return { valid: false, error: '角色重要性必须是数字' };
        }
        
        if (characterData.status !== undefined && typeof characterData.status !== 'string') {
            return { valid: false, error: '角色状态必须是字符串' };
        }
        
        return { valid: true };
    }

    // 验证删除角色请求
    static validateDeleteCharacterRequest(request) {
        if (!request.value || typeof request.value !== 'string') {
            return { valid: false, error: '删除角色必须指定角色名称' };
        }
        
        return { valid: true };
    }

    // 验证添加角色做过的事请求
    static validateAddCharacterThingDoneRequest(request) {
        const data = request.value;
        
        if (!data || typeof data !== 'object') {
            return { valid: false, error: '数据格式无效' };
        }
        
        if (!data.name || typeof data.name !== 'string') {
            return { valid: false, error: '必须指定角色名称' };
        }
        
        if (!data.thingDone || typeof data.thingDone !== 'string') {
            return { valid: false, error: '必须指定做过的事' };
        }
        
        return { valid: true };
    }

    // 验证添加物品/财产/知识/地点请求
    static validateAssetAddRequest(request) {
        const itemData = request.value;
        
        if (!itemData || typeof itemData !== 'object') {
            return { valid: false, error: '数据格式无效' };
        }
        
        if (!itemData.name || typeof itemData.name !== 'string') {
            return { valid: false, error: '必须包含名称' };
        }
        
        if (!itemData.description || typeof itemData.description !== 'string') {
            return { valid: false, error: '必须包含描述' };
        }
        
        return { valid: true };
    }

    // 验证删除物品/财产/知识/地点请求
    static validateAssetRemoveRequest(request) {
        if (!request.value || typeof request.value !== 'string') {
            return { valid: false, error: '必须指定名称' };
        }
        
        return { valid: true };
    }
}