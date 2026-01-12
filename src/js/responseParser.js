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
            dataRequests = this.parseDataRequests(response);
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
                
                // 匹配节拍操作格式: 节拍操作：推进 或 推进节拍
                const beatOperationMatch = line.match(/^(节拍操作：|)(推进|维持|完结)(节拍|)$/);
                if (beatOperationMatch) {
                    const [, , operation] = beatOperationMatch;
                    let normalizedOperation = operation.trim();
                    // 标准化操作值
                    if (normalizedOperation === '维持节拍') {
                        normalizedOperation = '维持';
                    } else if (normalizedOperation === '推进节拍' || normalizedOperation === '推进到下一节拍') {
                        normalizedOperation = '推进';
                    }
                    requests.push({
                        action: 'update',
                        path: 'narrative.storyBeatOperation',
                        value: normalizedOperation
                    });
                } else if (line.match(/^当前景深等级：(.+)$/)) {
                    // 匹配景深等级格式: 当前景深等级：2
                    const depthMatch = line.match(/^当前景深等级：(.+)$/);
                    const [, value] = depthMatch;
                    requests.push({
                        action: 'update',
                        path: 'narrative.depthLevel',
                        value: value.trim()
                    });
                } else if (line.match(/^当前时间：(.+)$/)) {
                    // 匹配时间设置格式: 当前时间：1925-12-26 00:00:00
                    const timeMatch = line.match(/^当前时间：(.+)$/);
                    const [, value] = timeMatch;
                    requests.push({
                        action: 'update',
                        path: 'metadata.currentTime',
                        value: value.trim()
                    });
                } else if (line.match(/^注册事件：(.+)$/)) {
                    // 匹配事件操作格式: 注册事件：{...}
                    const eventRegisterMatch = line.match(/^注册事件：(.+)$/);
                    try {
                        const eventData = JSON.parse(eventRegisterMatch[1]);
                        requests.push({
                            action: 'registerEvent',
                            value: eventData
                        });
                    } catch (e) {
                        console.error('解析事件数据错误:', e);
                    }
                } else if (line.match(/^更新事件：(.+)$/)) {
                    // 匹配事件更新格式: 更新事件：{...}
                    const eventUpdateMatch = line.match(/^更新事件：(.+)$/);
                    try {
                        const eventData = JSON.parse(eventUpdateMatch[1]);
                        requests.push({
                            action: 'updateEvent',
                            value: eventData
                        });
                    } catch (e) {
                        console.error('解析事件数据错误:', e);
                    }
                } else if (line.match(/^删除事件：(.+)$/)) {
                    // 匹配事件删除格式: 删除事件：事件名称
                    const eventDeleteMatch = line.match(/^删除事件：(.+)$/);
                    const [, eventName] = eventDeleteMatch;
                    requests.push({
                        action: 'deleteEvent',
                        value: eventName.trim()
                    });
                } else if (line.match(/^添加伏笔：(.+)$/)) {
                    // 匹配伏笔操作格式: 添加伏笔：{...}
                    const foreshadowingAddMatch = line.match(/^添加伏笔：(.+)$/);
                    try {
                        const foreshadowingData = JSON.parse(foreshadowingAddMatch[1]);
                        requests.push({
                            action: 'addForeshadowing',
                            value: foreshadowingData
                        });
                    } catch (e) {
                        console.error('解析伏笔数据错误:', e);
                    }
                } else if (line.match(/^更新伏笔：(.+)$/)) {
                    // 匹配伏笔更新格式: 更新伏笔：{...}
                    const foreshadowingUpdateMatch = line.match(/^更新伏笔：(.+)$/);
                    try {
                        const foreshadowingData = JSON.parse(foreshadowingUpdateMatch[1]);
                        requests.push({
                            action: 'updateForeshadowing',
                            value: foreshadowingData
                        });
                    } catch (e) {
                        console.error('解析伏笔数据错误:', e);
                    }
                } else if (line.match(/^删除伏笔：(.+)$/)) {
                    // 匹配伏笔删除格式: 删除伏笔：伏笔名称
                    const foreshadowingDeleteMatch = line.match(/^删除伏笔：(.+)$/);
                    const [, foreshadowingName] = foreshadowingDeleteMatch;
                    requests.push({
                        action: 'removeForeshadowing',
                        value: foreshadowingName.trim()
                    });
                } else if (line.match(/^完成成就：(.+)$/)) {
                    // 匹配成就完成格式: 完成成就：成就名称
                    const achievementCompleteMatch = line.match(/^完成成就：(.+)$/);
                    const [, achievementName] = achievementCompleteMatch;
                    requests.push({
                        action: 'completeAchievement',
                        value: achievementName.trim()
                    });
                } else if (line.match(/^显示成就：(.+)$/)) {
                    // 匹配成就显示格式: 显示成就：成就名称
                    const achievementShowMatch = line.match(/^显示成就：(.+)$/);
                    const [, achievementName] = achievementShowMatch;
                    requests.push({
                        action: 'showAchievement',
                        value: achievementName.trim()
                    });
                } else if (line.match(/^注册角色：(.+)$/)) {
                    // 匹配角色操作格式: 注册角色：{...}
                    const characterRegisterMatch = line.match(/^注册角色：(.+)$/);
                    try {
                        const characterData = JSON.parse(characterRegisterMatch[1]);
                        requests.push({
                            action: 'registerCharacter',
                            value: characterData
                        });
                    } catch (e) {
                        console.error('解析角色数据错误:', e);
                    }
                } else if (line.match(/^更新角色：(.+)$/)) {
                    // 匹配角色更新格式: 更新角色：{...}
                    const characterUpdateMatch = line.match(/^更新角色：(.+)$/);
                    try {
                        const characterData = JSON.parse(characterUpdateMatch[1]);
                        requests.push({
                            action: 'updateCharacter',
                            value: characterData
                        });
                    } catch (e) {
                        console.error('解析角色数据错误:', e);
                    }
                } else if (line.match(/^删除角色：(.+)$/)) {
                    // 匹配角色删除格式: 删除角色：角色名称
                    const characterDeleteMatch = line.match(/^删除角色：(.+)$/);
                    const [, characterName] = characterDeleteMatch;
                    requests.push({
                        action: 'deleteCharacter',
                        value: characterName.trim()
                    });
                } else if (line.match(/^添加角色做过的事：(.+?)，(.+)$/)) {
                    // 匹配快捷添加做过的事格式: 添加角色做过的事：角色名称，做过的事
                    const characterThingDoneMatch = line.match(/^添加角色做过的事：(.+?)，(.+)$/);
                    const [, characterName, thingDone] = characterThingDoneMatch;
                    requests.push({
                        action: 'addCharacterThingDone',
                        value: {
                            name: characterName.trim(),
                            thingDone: thingDone.trim()
                        }
                    });
                } else if (line.match(/^添加物品：(.+)$/)) {
                    // 匹配添加物品格式: 添加物品：{...}
                    const addItemMatch = line.match(/^添加物品：(.+)$/);
                    try {
                        const itemData = JSON.parse(addItemMatch[1]);
                        requests.push({
                            action: 'addItem',
                            value: itemData
                        });
                    } catch (e) {
                        console.error('解析物品数据错误:', e);
                    }
                } else if (line.match(/^添加资产：(.+)$/)) {
                    // 匹配添加资产格式: 添加资产：{...}
                    const addAssetMatch = line.match(/^添加资产：(.+)$/);
                    try {
                        const assetData = JSON.parse(addAssetMatch[1]);
                        requests.push({
                            action: 'addAsset',
                            value: assetData
                        });
                    } catch (e) {
                        console.error('解析资产数据错误:', e);
                    }
                } else if (line.match(/^添加知识：(.+)$/)) {
                    // 匹配添加知识格式: 添加知识：{...}
                    const addKnowledgeMatch = line.match(/^添加知识：(.+)$/);
                    try {
                        const knowledgeData = JSON.parse(addKnowledgeMatch[1]);
                        requests.push({
                            action: 'addKnowledge',
                            value: knowledgeData
                        });
                    } catch (e) {
                        console.error('解析知识数据错误:', e);
                    }
                } else if (line.match(/^删除物品：(.+)$/)) {
                    // 匹配删除物品格式: 删除物品：物品名称
                    const removeItemMatch = line.match(/^删除物品：(.+)$/);
                    const [, itemName] = removeItemMatch;
                    requests.push({
                        action: 'removeItem',
                        value: itemName.trim()
                    });
                } else if (line.match(/^删除资产：(.+)$/)) {
                    // 匹配删除资产格式: 删除资产：资产名称
                    const removeAssetMatch = line.match(/^删除资产：(.+)$/);
                    const [, assetName] = removeAssetMatch;
                    requests.push({
                        action: 'removeAsset',
                        value: assetName.trim()
                    });
                } else if (line.match(/^删除知识：(.+)$/)) {
                    // 匹配删除知识格式: 删除知识：知识名称
                    const removeKnowledgeMatch = line.match(/^删除知识：(.+)$/);
                    const [, knowledgeName] = removeKnowledgeMatch;
                    requests.push({
                        action: 'removeKnowledge',
                        value: knowledgeName.trim()
                    });
                } else if (line.match(/^更新物品：(.+)$/)) {
                    // 匹配更新物品格式: 更新物品：{...}
                    const updateItemMatch = line.match(/^更新物品：(.+)$/);
                    try {
                        const itemData = JSON.parse(updateItemMatch[1]);
                        requests.push({
                            action: 'updateItem',
                            value: itemData
                        });
                    } catch (e) {
                        console.error('解析物品数据错误:', e);
                    }
                } else if (line.match(/^更新资产：(.+)$/)) {
                    // 匹配更新资产格式: 更新资产：{...}
                    const updateAssetMatch = line.match(/^更新资产：(.+)$/);
                    try {
                        const assetData = JSON.parse(updateAssetMatch[1]);
                        requests.push({
                            action: 'updateAsset',
                            value: assetData
                        });
                    } catch (e) {
                        console.error('解析资产数据错误:', e);
                    }
                } else if (line.match(/^更新知识：(.+)$/)) {
                    // 匹配更新知识格式: 更新知识：{...}
                    const updateKnowledgeMatch = line.match(/^更新知识：(.+)$/);
                    try {
                        const knowledgeData = JSON.parse(updateKnowledgeMatch[1]);
                        requests.push({
                            action: 'updateKnowledge',
                            value: knowledgeData
                        });
                    } catch (e) {
                        console.error('解析知识数据错误:', e);
                    }
                } else if (line.match(/^添加地点：(.+)$/)) {
                    // 匹配添加地点格式: 添加地点：{...}
                    const addLocationMatch = line.match(/^添加地点：(.+)$/);
                    try {
                        const locationData = JSON.parse(addLocationMatch[1]);
                        requests.push({
                            action: 'addLocation',
                            value: locationData
                        });
                    } catch (e) {
                        console.error('解析地点数据错误:', e);
                    }
                } else if (line.match(/^删除地点：(.+)$/)) {
                    // 匹配删除地点格式: 删除地点：地点名称
                    const removeLocationMatch = line.match(/^删除地点：(.+)$/);
                    const [, locationName] = removeLocationMatch;
                    requests.push({
                        action: 'removeLocation',
                        value: locationName.trim()
                    });
                } else if (line.match(/^更新地点：(.+)$/)) {
                    // 匹配更新地点格式: 更新地点：{...}
                    const updateLocationMatch = line.match(/^更新地点：(.+)$/);
                    try {
                        const locationData = JSON.parse(updateLocationMatch[1]);
                        requests.push({
                            action: 'updateLocation',
                            value: locationData
                        });
                    } catch (e) {
                        console.error('解析地点数据错误:', e);
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
        } else if (request.action === 'registerCharacter' || request.action === 'updateCharacter') {
            return this.validateCharacterRequest(request);
        } else if (request.action === 'deleteCharacter') {
            return this.validateDeleteCharacterRequest(request);
        } else if (request.action === 'addCharacterThingDone') {
            return this.validateAddCharacterThingDoneRequest(request);
        } else if (request.action === 'addItem' || request.action === 'addAsset' || request.action === 'addKnowledge' || request.action === 'addLocation') {
            return this.validateInventoryAddRequest(request);
        } else if (request.action === 'removeItem' || request.action === 'removeAsset' || request.action === 'removeKnowledge' || request.action === 'removeLocation') {
            return this.validateInventoryRemoveRequest(request);
        } else if (request.action === 'updateItem' || request.action === 'updateAsset' || request.action === 'updateKnowledge' || request.action === 'updateLocation') {
            return this.validateInventoryAddRequest(request);
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
                    '维持', '维持在当前节拍',
                    '完结'
                ];
                
                if (!allowedOperations.includes(request.value)) {
                    return { valid: false, error: '只允许推进节拍、维持节拍或完结操作' };
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

    // 验证添加物品/资产/知识请求
    static validateInventoryAddRequest(request) {
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

    // 验证删除物品/资产/知识请求
    static validateInventoryRemoveRequest(request) {
        if (!request.value || typeof request.value !== 'string') {
            return { valid: false, error: '必须指定名称' };
        }
        
        return { valid: true };
    }
}