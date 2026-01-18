// 游戏引擎核心模块
class GameEngine {
    constructor() {
        this.dataManager = null;
        this.responseParser = null;
        this.narrativeRhythmController = null;
        this.isInitialized = false;
        this.gameData = {};
        this.achievementsData = {}; // 成就数据，不会随新游戏重置
    }

    // 初始化引擎
    async initialize() {
        try {
            console.log('开始初始化游戏引擎');
            
            // 加载依赖模块
            this.loadDependencies();
            
            // 加载初始游戏数据
            await this.loadGameData();
            
            // 加载成就数据
            await this.loadAchievementsData();
            
            this.isInitialized = true;
            console.log('游戏引擎初始化成功');
            
            return {
                success: true,
                message: '游戏引擎初始化成功'
            };
        } catch (error) {
            console.error('游戏引擎初始化错误:', error);
            return {
                success: false,
                message: '游戏引擎初始化失败',
                error: error.message
            };
        }
    }

    // 加载依赖模块
    loadDependencies() {
        // 检查并加载数据管理模块
        if (typeof DataManager !== 'undefined') {
            this.dataManager = DataManager;
            console.log('成功加载数据管理模块');
        } else {
            throw new Error('数据管理模块未加载');
        }

        // 检查并加载响应解析模块
        if (typeof ResponseParser !== 'undefined') {
            this.responseParser = ResponseParser;
            console.log('成功加载响应解析模块');
        } else {
            throw new Error('响应解析模块未加载');
        }

        // 检查并加载叙事节奏控制模块
        if (typeof NarrativeRhythmController !== 'undefined') {
            this.narrativeRhythmController = new NarrativeRhythmController(this.dataManager);
            console.log('成功加载叙事节奏控制模块');
        } else {
            throw new Error('叙事节奏控制模块未加载');
        }
    }

    // 加载游戏数据
    async loadGameData() {
        try {
            // 尝试从data.json加载数据
            this.gameData = await this.dataManager.readData();
            
            // 如果数据为空，使用默认数据
            if (Object.keys(this.gameData).length === 0) {
                this.gameData = this.dataManager.getDefaultData();
                console.log('使用默认游戏数据');
            }
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
                console.log('初始化events数组');
            }
            
            // 确保foreshadowings数组存在
            if (!this.gameData.foreshadowings) {
                this.gameData.foreshadowings = [];
                console.log('初始化foreshadowings数组');
            }
            
            // 确保characters数组存在
            if (!this.gameData.characters) {
                this.gameData.characters = [];
                console.log('初始化characters数组');
            }
            
            // 确保narrative对象存在
            if (!this.gameData.narrative) {
                this.gameData.narrative = {};
                console.log('初始化narrative对象');
            }
            
            // 确保beatStats对象存在
            if (!this.gameData.narrative.beatStats) {
                this.gameData.narrative.beatStats = {
                    current: {
                        '起': 0,
                        '承': 0,
                        '转': 0,
                        '合': 0
                    },
                    previous: {
                        '起': 0,
                        '承': 0,
                        '转': 0,
                        '合': 0
                    }
                };
                console.log('初始化beatStats对象');
            }
            
            // 确保节拍循环相关字段存在
            if (!this.gameData.narrative.currentBeatCycle) {
                this.gameData.narrative.currentBeatCycle = 1;
                console.log('初始化currentBeatCycle');
            }
            
            if (!this.gameData.narrative.totalWords) {
                this.gameData.narrative.totalWords = 0;
                console.log('初始化totalWords');
            }
            
            if (!this.gameData.narrative.currentCycleWords) {
                this.gameData.narrative.currentCycleWords = 0;
                console.log('初始化currentCycleWords');
            }
            
            // 确保当前游戏会话的伟业达成标志存在且初始为false
            this.gameData.narrative.hasAchievedGreatnessInCurrentGame = false;
            console.log('初始化hasAchievedGreatnessInCurrentGame标志为false');
            
            console.log('游戏数据加载成功:', this.gameData);
            return this.gameData;
        } catch (error) {
            console.error('加载游戏数据错误:', error);
            // 使用默认数据作为 fallback
            this.gameData = this.dataManager.getDefaultData();
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
            }
            return this.gameData;
        }
    }

    // 加载成就数据
    async loadAchievementsData() {
        try {
            // 尝试从achievements.json加载数据
            this.achievementsData = await this.dataManager.readAchievements();
            
            // 确保成就数组存在
            if (!this.achievementsData.achievements) {
                this.achievementsData.achievements = [];
                console.log('初始化achievements数组');
            }
            
            // 确保已完成成就数组存在
            if (!this.achievementsData.completedAchievements) {
                this.achievementsData.completedAchievements = [];
                console.log('初始化completedAchievements数组');
            }
            
            // 确保metadata对象存在
            if (!this.achievementsData.metadata) {
                this.achievementsData.metadata = {
                    lastUpdated: new Date().toISOString(),
                    version: "1.0.0"
                };
                console.log('初始化成就metadata对象');
            }
            
            console.log('成就数据加载成功:', this.achievementsData);
            return this.achievementsData;
        } catch (error) {
            console.error('加载成就数据错误:', error);
            // 使用默认数据作为 fallback
            this.achievementsData = this.dataManager.getDefaultAchievementsData();
            return this.achievementsData;
        }
    }

    // 处理AI响应
    async processAIResponse(response) {
        try {
            console.log('开始处理AI响应');
            
            // 解析响应
            const parseResult = this.responseParser.parseResponse(response);
            
            if (!parseResult.success) {
                console.warn('响应解析警告:', parseResult.error);
            }
            
            // 检查是否包含时间设置请求
            let hasTimeSet = false;
            if (parseResult.dataRequests && parseResult.dataRequests.length > 0) {
                hasTimeSet = parseResult.dataRequests.some(request => 
                    request.action === 'update' && request.path === 'currentTime'
                );
            }
            
            // 处理数据请求
            if (parseResult.dataRequests && parseResult.dataRequests.length > 0) {
                await this.processDataRequests(parseResult.dataRequests);
            } else {
                // 如果没有数据请求，使用默认值（维持和上一轮对话相同）
                console.warn('没有数据请求，使用默认值（维持和上一轮对话相同）');
                await this.processDefaultDataRequests();
            }
            
            // 如果AI没有设置时间，根据景深等级推进时间
            if (!hasTimeSet) {
                const depthLevel = parseInt(this.gameData.narrative?.depthLevel || '3');
                const newTime = this.calculateDefaultTime(depthLevel);
                this.gameData = this.dataManager.updateDataByPath(
                    this.gameData,
                    'currentTime',
                    newTime
                );
                await this.saveGameData();
            }
            
            // 如果有世界状态简报，保存到游戏数据中
            if (parseResult.worldStatusBrief && parseResult.worldStatusBrief.trim()) {
                this.gameData = this.dataManager.updateDataByPath(
                    this.gameData,
                    'worldStatusBrief',
                    parseResult.worldStatusBrief.trim()
                );
                await this.saveGameData();
            }
            
            // 检查事件时间状态
            await this.checkEventTimeStatus();
            
            console.log('AI响应处理完成');
            
            return {
                story: parseResult.story,
                dataUpdated: parseResult.dataRequests.length > 0,
                success: true
            };
        } catch (error) {
            console.error('处理AI响应错误:', error);
            
            // 即使出错，也使用默认值（维持和上一轮对话相同）
            try {
                await this.processDefaultDataRequests();
            } catch (defaultError) {
                console.error('处理默认数据请求错误:', defaultError);
            }
            
            return {
                story: response,
                dataUpdated: false,
                success: false,
                error: error.message
            };
        }
    }

    // 处理数据请求
    async processDataRequests(requests) {

        try {
            console.log('开始处理数据请求:', requests);
            
            // 验证请求格式
            const validRequests = [];
            const errors = [];
            
            for (const request of requests) {
                const validation = this.responseParser.validateRequest(request);
                if (validation.valid) {
                    validRequests.push(request);
                } else {
                    errors.push(validation.error);
                }
            }
            
            if (errors.length > 0) {
                console.warn('数据请求验证错误:', errors);
            }
            
            // 重新排序请求：先处理角色注册，后处理节拍操作
            // 这样在节拍从其他节拍进入终幕或后日谈的回复中，仍然可以注册新角色
            const reorderedRequests = [
                // 先处理角色相关请求
                ...validRequests.filter(req => req.action === 'registerCharacter'),
                // 然后处理其他请求
                ...validRequests.filter(req => req.action !== 'registerCharacter')
            ];
            
            console.log('重新排序后的请求:', reorderedRequests);
            
            // 处理有效的请求
            for (const request of reorderedRequests) {
                await this.processSingleRequest(request);
            }
            
            // 保存更新后的数据
            await this.saveGameData();
            
            console.log('数据请求处理完成');
            return {
                success: true,
                processedCount: validRequests.length,
                errors: errors.length
            };
        } catch (error) {
            console.error('处理数据请求错误:', error);
            return {
                success: false,
                error: error.message
            };
        }

    }

    // 处理单个数据请求
    async processSingleRequest(request) {
        try {
            console.log('处理单个数据请求:', request);
            
            // 处理事件操作
            if (request.action === 'registerEvent') {
                await this.registerEvent(request.value);
            } else if (request.action === 'updateEvent') {
                await this.updateEvent(request.value);
            } else if (request.action === 'deleteEvent') {
                await this.deleteEvent(request.value);
            } else if (request.action === 'completeAchievement') {
                // 处理成就完成操作
                await this.completeAchievement(request.value);
            } else if (request.action === 'showAchievement') {
                // 处理成就显示操作
                await this.showAchievement(request.value);
            } else if (request.action === 'registerCharacter') {
                await this.registerCharacter(request.value);
            } else if (request.action === 'updateCharacter') {
                await this.updateCharacter(request.value);
            } else if (request.action === 'deleteCharacter') {
                await this.deleteCharacter(request.value);
            } else if (request.action === 'addCharacterThingDone') {
                await this.addCharacterThingDone(request.value);
            } else if (request.action === 'addItem') {
                await this.addItem(request.value);
            } else if (request.action === 'addProperty') {
                await this.addProperty(request.value);
            } else if (request.action === 'addKnowledge') {
                await this.addKnowledge(request.value);
            } else if (request.action === 'removeItem') {
                await this.removeItem(request.value);
            } else if (request.action === 'removeProperty') {
                await this.removeProperty(request.value);
            } else if (request.action === 'removeKnowledge') {
                await this.removeKnowledge(request.value);
            } else if (request.action === 'updateItem') {
                await this.updateItem(request.value);
            } else if (request.action === 'updateProperty') {
                await this.updateProperty(request.value);
            } else if (request.action === 'updateKnowledge') {
                await this.updateKnowledge(request.value);
            } else if (request.action === 'addLocation') {
                await this.addLocation(request.value);
            } else if (request.action === 'updateLocation') {
                await this.updateLocation(request.value);
            } else if (request.action === 'removeLocation') {
                await this.removeLocation(request.value);
            } else if (request.action === 'advanceTime') {
                await this.advanceTime(request.value);
            } else if (request.action === 'addForeshadowing') {
                await this.addForeshadowing(request.value);
            } else if (request.action === 'updateForeshadowing') {
                await this.updateForeshadowing(request.value);
            } else if (request.action === 'removeForeshadowing') {
                await this.removeForeshadowing(request.value);
            } else if (request.action === 'update') {
                // 处理节拍操作
                if (request.path === 'narrative.storyBeatOperation') {
                    const result = this.narrativeRhythmController.processStoryBeatOperation(this.gameData, request.value);
                    this.gameData = result.gameData;
                } else if (request.path === 'narrative.depthLevel') {
                    // 处理景深等级更新
                    this.gameData = this.narrativeRhythmController.processDepthLevel(this.gameData, request.value);
                } else {
                    // 处理其他普通更新
                    this.gameData = this.dataManager.updateDataByPath(
                        this.gameData,
                        request.path,
                        request.value
                    );
                }
            } else {
                console.warn('未知的操作类型:', request.action);
            }
            
            console.log('单个数据请求处理成功');
            return { success: true };
        } catch (error) {
            console.error('处理单个数据请求错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 注册事件
    async registerEvent(eventData) {
        try {
            console.log('开始注册事件:', eventData);
            
            // 检查是否在后日谈
            const currentBeat = this.gameData.narrative?.storyBeat || '起';
            if (currentBeat === '后日谈') {
                console.log('在后日谈中，不可以注册新事件');
                return { success: false, error: '在后日谈中，不可以注册新事件' };
            }
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
            }
            
            // 检查是否已存在同名事件
            const existingEventIndex = this.gameData.events.findIndex(event => event.name === eventData.name);
            
            if (existingEventIndex >= 0) {
                // 存在同名事件，更新它
                console.log('存在同名事件，更新它:', eventData.name);
                this.gameData.events[existingEventIndex] = {
                    ...this.gameData.events[existingEventIndex],
                    ...eventData,
                    currentTime: this.gameData.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
            } else {
                // 不存在同名事件，添加新事件
                console.log('添加新事件:', eventData.name);
                const newEvent = {
                    ...eventData,
                    currentTime: this.gameData.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                this.gameData.events.push(newEvent);
            }
            
            console.log('事件注册成功');
            return { success: true };
        } catch (error) {
            console.error('注册事件错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新事件
    async updateEvent(eventData) {
        try {
            console.log('开始更新事件:', eventData);
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
                return { success: false, error: '事件数组不存在' };
            }
            
            // 查找同名事件
            const existingEventIndex = this.gameData.events.findIndex(event => event.name === eventData.name);
            
            if (existingEventIndex >= 0) {
                // 更新事件
                this.gameData.events[existingEventIndex] = {
                    ...this.gameData.events[existingEventIndex],
                    ...eventData,
                    currentTime: this.gameData.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
                console.log('事件更新成功:', eventData.name);
                return { success: true };
            } else {
                // 不存在同名事件，注册为新事件
                console.log('不存在同名事件，注册为新事件:', eventData.name);
                return await this.registerEvent(eventData);
            }
        } catch (error) {
            console.error('更新事件错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除事件
    async deleteEvent(eventName) {
        try {
            console.log('开始删除事件:', eventName);
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
                return { success: false, error: '事件数组不存在' };
            }
            
            // 查找并删除同名事件
            const initialLength = this.gameData.events.length;
            this.gameData.events = this.gameData.events.filter(event => event.name !== eventName);
            
            if (this.gameData.events.length < initialLength) {
                console.log('事件删除成功:', eventName);
                return { success: true };
            } else {
                console.warn('事件不存在:', eventName);
                return { success: false, error: '事件不存在' };
            }
        } catch (error) {
            console.error('删除事件错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加伏笔
    async addForeshadowing(foreshadowingData) {
        try {
            console.log('开始添加伏笔:', foreshadowingData);
            
            // 确保foreshadowings数组存在
            if (!this.gameData.foreshadowings) {
                this.gameData.foreshadowings = [];
            }
            
            // 检查是否已存在同名伏笔
            const existingForeshadowingIndex = this.gameData.foreshadowings.findIndex(
                foreshadowing => foreshadowing.name === foreshadowingData.name
            );
            
            if (existingForeshadowingIndex >= 0) {
                // 存在同名伏笔，更新它
                console.log('存在同名伏笔，更新它:', foreshadowingData.name);
                this.gameData.foreshadowings[existingForeshadowingIndex] = {
                    ...this.gameData.foreshadowings[existingForeshadowingIndex],
                    ...foreshadowingData
                };
            } else {
                // 不存在同名伏笔，添加新伏笔
                console.log('添加新伏笔:', foreshadowingData.name);
                this.gameData.foreshadowings.push(foreshadowingData);
                
                // 检查伏笔数量限制
                this.checkForeshadowingLimit();
            }
            
            console.log('伏笔添加成功');
            return { success: true };
        } catch (error) {
            console.error('添加伏笔错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新伏笔
    async updateForeshadowing(foreshadowingData) {
        try {
            console.log('开始更新伏笔:', foreshadowingData);
            
            // 确保foreshadowings数组存在
            if (!this.gameData.foreshadowings) {
                this.gameData.foreshadowings = [];
                return { success: false, error: '伏笔数组不存在' };
            }
            
            // 查找同名伏笔
            const existingForeshadowingIndex = this.gameData.foreshadowings.findIndex(
                foreshadowing => foreshadowing.name === foreshadowingData.name
            );
            
            if (existingForeshadowingIndex >= 0) {
                // 更新伏笔
                this.gameData.foreshadowings[existingForeshadowingIndex] = {
                    ...this.gameData.foreshadowings[existingForeshadowingIndex],
                    ...foreshadowingData
                };
                console.log('伏笔更新成功:', foreshadowingData.name);
                return { success: true };
            } else {
                // 不存在同名伏笔，添加为新伏笔
                console.log('不存在同名伏笔，添加为新伏笔:', foreshadowingData.name);
                return await this.addForeshadowing(foreshadowingData);
            }
        } catch (error) {
            console.error('更新伏笔错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除伏笔
    async removeForeshadowing(foreshadowingName) {
        try {
            console.log('开始删除伏笔:', foreshadowingName);
            
            // 确保foreshadowings数组存在
            if (!this.gameData.foreshadowings) {
                this.gameData.foreshadowings = [];
                return { success: false, error: '伏笔数组不存在' };
            }
            
            // 查找并删除同名伏笔
            const initialLength = this.gameData.foreshadowings.length;
            this.gameData.foreshadowings = this.gameData.foreshadowings.filter(
                foreshadowing => foreshadowing.name !== foreshadowingName
            );
            
            if (this.gameData.foreshadowings.length < initialLength) {
                console.log('伏笔删除成功:', foreshadowingName);
                return { success: true };
            } else {
                console.warn('伏笔不存在:', foreshadowingName);
                return { success: false, error: '伏笔不存在' };
            }
        } catch (error) {
            console.error('删除伏笔错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 检查伏笔数量限制
    checkForeshadowingLimit() {
        // 硬限制：20个伏笔
        const hardLimit = 20;
        // 推荐限制：12个伏笔
        const recommendedLimit = 12;
        
        // 检查硬限制
        if (this.gameData.foreshadowings.length > hardLimit) {
            console.log('伏笔数量超过硬限制，删除重要程度最低的伏笔');
            // 按重要程度排序，删除重要程度最低的
            this.gameData.foreshadowings.sort((a, b) => (b.importance || 0) - (a.importance || 0));
            this.gameData.foreshadowings = this.gameData.foreshadowings.slice(0, hardLimit);
        } else if (this.gameData.foreshadowings.length > recommendedLimit) {
            console.log('伏笔数量超过推荐限制，建议删除不重要的伏笔');
            // 这里可以添加逻辑，自动删除重要程度较低的伏笔
        }
    }

    // 检查事件时间状态
    async checkEventTimeStatus() {
        try {
            console.log('开始检查事件时间状态');
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
                return;
            }
            
            const currentTime = this.gameData.currentTime;
            if (!currentTime) {
                console.warn('当前时间未设置');
                return;
            }
            
            // 检查每个事件的时间状态
            const eventsToRemove = [];
            
            for (let i = 0; i < this.gameData.events.length; i++) {
                const event = this.gameData.events[i];
                console.log('检查事件:', event.name);
                
                // 检查事件是否已到达预期结束时间
                if (event.expectedEndTime && this.compareTimes(currentTime, event.expectedEndTime) >= 0) {
                    console.log('事件已到达预期结束时间:', event.name);
                    // 如果事件未更新，标记为删除
                    eventsToRemove.push(i);
                }
            }
            
            // 删除标记的事件
            for (let i = eventsToRemove.length - 1; i >= 0; i--) {
                const eventIndex = eventsToRemove[i];
                console.log('删除已结束的事件:', this.gameData.events[eventIndex].name);
                this.gameData.events.splice(eventIndex, 1);
            }
            
            // 如果有事件被删除，保存数据
            if (eventsToRemove.length > 0) {
                await this.saveGameData();
            }
            
            console.log('事件时间状态检查完成');
        } catch (error) {
            console.error('检查事件时间状态错误:', error);
        }
    }

    // 比较时间
    compareTimes(time1, time2) {
        const date1 = new Date(time1.replace(' ', 'T') + 'Z');
        const date2 = new Date(time2.replace(' ', 'T') + 'Z');
        return date1.getTime() - date2.getTime();
    }



    // 处理默认数据请求（当AI响应中没有数据请求时使用）
    async processDefaultDataRequests() {
        try {
            console.log('开始处理默认数据请求');
            
            // 检查是否已经设置了时间
            const hasTimeSet = this.gameData.currentTime;
            
            // 使用默认值：维持节拍，使用上一轮的景深等级，推进时间（如果未设置）
            const defaultRequests = [
                {
                    action: 'update',
                    path: 'narrative.storyBeatOperation',
                    value: '维持'
                },
                {
                    action: 'update',
                    path: 'narrative.depthLevel',
                    value: this.gameData.narrative?.depthLevel || '3'
                }
            ];
            
            // 如果没有设置时间，根据景深等级推进时间
            if (!hasTimeSet) {
                const depthLevel = parseInt(this.gameData.narrative?.depthLevel || '3');
                const newTime = this.calculateDefaultTime(depthLevel);
                defaultRequests.push({
                    action: 'update',
                    path: 'currentTime',
                    value: newTime
                });
            }
            
            // 处理默认数据请求
            await this.processDataRequests(defaultRequests);
            
            console.log('默认数据请求处理完成');
            return { success: true };
        } catch (error) {
            console.error('处理默认数据请求错误:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 计算默认时间推进
    calculateDefaultTime(depthLevel) {
        try {
            console.log('计算默认时间推进，景深等级:', depthLevel);
            
            // 获取当前时间
            const currentTimeStr = this.gameData.currentTime || '1925-12-26 00:00:00';
            const currentTime = new Date(currentTimeStr.replace(' ', 'T') + 'Z');
            
            // 根据景深等级计算推进时间（毫秒）
            let advanceMs = 0;
            switch (depthLevel) {
                case 1:
                    advanceMs = 24 * 60 * 60 * 1000; // 1天
                    break;
                case 2:
                    advanceMs = 8 * 60 * 60 * 1000; // 8小时
                    break;
                case 3:
                    advanceMs = 2 * 60 * 60 * 1000; // 2小时
                    break;
                case 4:
                    advanceMs = 15 * 60 * 1000; // 15分钟
                    break;
                case 5:
                    advanceMs = 1 * 60 * 1000; // 1分钟
                    break;
                default:
                    advanceMs = 2 * 60 * 60 * 1000; // 默认2小时
            }
            
            // 计算新时间
            const newTime = new Date(currentTime.getTime() + advanceMs);
            
            // 格式化时间为 YYYY-MM-DD HH:mm:ss
            const year = newTime.getUTCFullYear();
            const month = String(newTime.getUTCMonth() + 1).padStart(2, '0');
            const day = String(newTime.getUTCDate()).padStart(2, '0');
            const hours = String(newTime.getUTCHours()).padStart(2, '0');
            const minutes = String(newTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(newTime.getUTCSeconds()).padStart(2, '0');
            
            const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            console.log(`时间推进: ${currentTimeStr} → ${formattedTime} (景深等级 ${depthLevel})`);
            
            return formattedTime;
        } catch (error) {
            console.error('计算默认时间错误:', error);
            // 出错时返回当前时间或默认时间
            return this.gameData.currentTime || '1925-12-26 00:00:00';
        }
    }
    
    // 推进时间
    async advanceTime(advanceMs) {
        try {
            console.log('开始推进时间:', advanceMs);
            
            // 获取当前时间
            const currentTimeStr = this.gameData.currentTime || '1925-12-26 00:00:00';
            const currentTime = new Date(currentTimeStr.replace(' ', 'T') + 'Z');
            
            // 计算新时间
            const newTime = new Date(currentTime.getTime() + advanceMs);
            
            // 格式化时间为 YYYY-MM-DD HH:mm:ss
            const year = newTime.getUTCFullYear();
            const month = String(newTime.getUTCMonth() + 1).padStart(2, '0');
            const day = String(newTime.getUTCDate()).padStart(2, '0');
            const hours = String(newTime.getUTCHours()).padStart(2, '0');
            const minutes = String(newTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(newTime.getUTCSeconds()).padStart(2, '0');
            
            const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            // 更新当前时间
            this.gameData.currentTime = formattedTime;
            
            console.log(`时间推进完成: ${currentTimeStr} → ${formattedTime}`);
            return { success: true };
        } catch (error) {
            console.error('推进时间错误:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 保存游戏数据
    async saveGameData() {
        try {
            // 保存数据
            const result = await this.dataManager.writeData(this.gameData);
            
            if (result) {
                console.log('游戏数据保存成功');
                return { success: true };
            } else {
                throw new Error('保存数据失败');
            }
        } catch (error) {
            console.error('保存游戏数据错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 保存成就数据
    async saveAchievementsData() {
        try {
            // 更新元数据
            this.achievementsData.metadata = {
                ...this.achievementsData.metadata,
                lastUpdated: new Date().toISOString()
            };
            
            // 保存数据
            const result = await this.dataManager.writeAchievements(this.achievementsData);
            
            if (result) {
                console.log('成就数据保存成功');
                return { success: true };
            } else {
                throw new Error('保存成就数据失败');
            }
        } catch (error) {
            console.error('保存成就数据错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 完成成就
    async completeAchievement(achievementName) {
        try {
            console.log('开始完成成就:', achievementName);
            
            // 确保成就数据存在
            if (!this.achievementsData || !this.achievementsData.achievements) {
                this.achievementsData = this.dataManager.getDefaultAchievementsData();
            }
            
            // 查找成就
            const achievementIndex = this.achievementsData.achievements.findIndex(
                achievement => achievement.name === achievementName
            );
            
            if (achievementIndex >= 0) {
                // 更新成就状态
                this.achievementsData.achievements[achievementIndex].isCompleted = true;
                
                // 特殊处理：如果是隐藏成就，完成后自动显示
                if (this.achievementsData.achievements[achievementIndex].isHidden) {
                    this.achievementsData.achievements[achievementIndex].isHidden = false;
                    console.log('隐藏成就已完成并显示:', achievementName);
                }
                
                // 检查是否已在完成列表中
                const isInCompletedList = this.achievementsData.completedAchievements.some(
                    achievement => achievement.name === achievementName
                );
                
                if (!isInCompletedList) {
                    // 添加到完成列表
                    this.achievementsData.completedAchievements.push({
                        name: achievementName,
                        completedAt: new Date().toISOString()
                    });
                }
                
                // 特殊处理：如果是雾上灯成就，打开GitHub链接
                if (achievementName === '雾上灯') {
                    console.log('打开雾上灯成就的GitHub链接');
                    // 在浏览器中打开新标签页
                    if (typeof window !== 'undefined' && window.open) {
                        window.open('https://github.com/xcrv2000/a_glimpse_of_ascension/', '_blank');
                    }
                }
                
                // 检查是否达成伟业，如果是，设置当前游戏会话的后日谈标志
                if (achievementName.includes('伟业')) {
                    console.log('AI声明达成伟业，设置当前游戏会话的后日谈标志');
                    // 设置当前游戏会话的达成伟业标志，在当前节拍循环结束后进入后日谈
                    // 这个标志会在新游戏开始时被重置
                    this.gameData = this.dataManager.updateDataByPath(
                        this.gameData,
                        'narrative.hasAchievedGreatnessInCurrentGame',
                        true
                    );
                }
                
                await this.saveAchievementsData();
                console.log('成就完成成功:', achievementName);
                return { success: true };
            } else {
                console.warn('成就不存在:', achievementName);
                return { success: false, error: '成就不存在' };
            }
        } catch (error) {
            console.error('完成成就错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 显示成就
    async showAchievement(achievementName) {
        try {
            console.log('开始显示成就:', achievementName);
            
            // 确保成就数据存在
            if (!this.achievementsData || !this.achievementsData.achievements) {
                this.achievementsData = this.dataManager.getDefaultAchievementsData();
            }
            
            // 查找成就
            const achievementIndex = this.achievementsData.achievements.findIndex(
                achievement => achievement.name === achievementName
            );
            
            if (achievementIndex >= 0) {
                // 更新成就状态
                this.achievementsData.achievements[achievementIndex].isHidden = false;
                
                await this.saveAchievementsData();
                console.log('成就显示成功:', achievementName);
                return { success: true };
            } else {
                console.warn('成就不存在:', achievementName);
                return { success: false, error: '成就不存在' };
            }
        } catch (error) {
            console.error('显示成就错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 清空已完成成就
    async clearCompletedAchievements() {
        try {
            console.log('开始清空已完成成就');
            
            // 确保成就数据存在
            if (!this.achievementsData) {
                this.achievementsData = this.dataManager.getDefaultAchievementsData();
            }
            
            // 使用dataManager的方法清空成就
            this.achievementsData = this.dataManager.clearCompletedAchievements(this.achievementsData);
            
            await this.saveAchievementsData();
            console.log('清空已完成成就成功');
            return { success: true };
        } catch (error) {
            console.error('清空已完成成就错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 注册角色
    async registerCharacter(characterData) {
        try {
            console.log('开始注册角色:', characterData);
            
            // 检查是否在终幕或后日谈
            const currentBeat = this.gameData.narrative?.storyBeat || '起';
            if (currentBeat === '终幕' || currentBeat === '后日谈') {
                console.log('在终幕或后日谈中，不可以注册新角色');
                return { success: false, error: '在终幕或后日谈中，不可以注册新角色' };
            }
            
            // 确保characters数组存在
            if (!this.gameData.characters) {
                this.gameData.characters = [];
            }
            
            // 验证并处理template
            const validTemplate = this.validateCharacterTemplate(characterData.template);
            if (validTemplate !== characterData.template) {
                console.log(`角色模板 ${characterData.template} 无效，替换为 ${validTemplate}`);
                characterData.template = validTemplate;
            }
            
            // 检查是否已存在同名角色
            const existingCharacterIndex = this.gameData.characters.findIndex(character => character.name === characterData.name);
            
            if (existingCharacterIndex >= 0) {
                // 存在同名角色，更新它
                console.log('存在同名角色，更新它:', characterData.name);
                this.gameData.characters[existingCharacterIndex] = {
                    ...this.gameData.characters[existingCharacterIndex],
                    ...characterData,
                    thingsDone: characterData.thingsDone || this.gameData.characters[existingCharacterIndex].thingsDone || [],
                    behaviorPattern: characterData.behaviorPattern || this.gameData.characters[existingCharacterIndex].behaviorPattern || ""
                };
            } else {
                // 不存在同名角色，添加新角色
                console.log('添加新角色:', characterData.name);
                const newCharacter = {
                    ...characterData,
                    thingsDone: characterData.thingsDone || [],
                    behaviorPattern: characterData.behaviorPattern || ""
                };
                this.gameData.characters.push(newCharacter);
            }
            
            console.log('角色注册成功');
            return { success: true };
        } catch (error) {
            console.error('注册角色错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 验证角色模板
    validateCharacterTemplate(template) {
        // 有效的角色模板列表
        const validTemplates = ['蜂', '蚁', '蛾', '蝶', '蝗', '蜣', '螳', '蝎', '蛛', '蛉', '蝉', '萤'];
        
        // 检查模板是否有效
        if (validTemplates.includes(template)) {
            return template;
        } else {
            // 随机选择一个有效的模板
            const randomIndex = Math.floor(Math.random() * validTemplates.length);
            return validTemplates[randomIndex];
        }
    }

    // 更新角色
    async updateCharacter(characterData) {
        try {
            console.log('开始更新角色:', characterData);
            
            // 确保characters数组存在
            if (!this.gameData.characters) {
                this.gameData.characters = [];
                return { success: false, error: '角色数组不存在' };
            }
            
            // 验证并处理template
            const validTemplate = this.validateCharacterTemplate(characterData.template);
            if (validTemplate !== characterData.template) {
                console.log(`角色模板 ${characterData.template} 无效，替换为 ${validTemplate}`);
                characterData.template = validTemplate;
            }
            
            // 查找同名角色
            const existingCharacterIndex = this.gameData.characters.findIndex(character => character.name === characterData.name);
            
            if (existingCharacterIndex >= 0) {
                // 更新角色
                this.gameData.characters[existingCharacterIndex] = {
                    ...this.gameData.characters[existingCharacterIndex],
                    ...characterData,
                    thingsDone: characterData.thingsDone || this.gameData.characters[existingCharacterIndex].thingsDone || [],
                    behaviorPattern: characterData.behaviorPattern || this.gameData.characters[existingCharacterIndex].behaviorPattern || ""
                };
                console.log('角色更新成功:', characterData.name);
                return { success: true };
            } else {
                // 不存在同名角色，注册为新角色
                console.log('不存在同名角色，注册为新角色:', characterData.name);
                return await this.registerCharacter(characterData);
            }
        } catch (error) {
            console.error('更新角色错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 删除角色
    async deleteCharacter(characterName) {
        try {
            console.log('开始删除角色:', characterName);
            
            // 确保characters数组存在
            if (!this.gameData.characters) {
                this.gameData.characters = [];
                return { success: false, error: '角色数组不存在' };
            }
            
            // 查找并删除同名角色
            const initialLength = this.gameData.characters.length;
            this.gameData.characters = this.gameData.characters.filter(character => character.name !== characterName);
            
            if (this.gameData.characters.length < initialLength) {
                console.log('角色删除成功:', characterName);
                return { success: true };
            } else {
                console.warn('角色不存在:', characterName);
                return { success: false, error: '角色不存在' };
            }
        } catch (error) {
            console.error('删除角色错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 快捷添加角色做过的事
    async addCharacterThingDone(thingDoneData) {
        try {
            console.log('开始添加角色做过的事:', thingDoneData);
            
            // 确保characters数组存在
            if (!this.gameData.characters) {
                this.gameData.characters = [];
                return { success: false, error: '角色数组不存在' };
            }
            
            // 查找角色
            const characterIndex = this.gameData.characters.findIndex(character => character.name === thingDoneData.name);
            
            if (characterIndex >= 0) {
                // 确保thingsDone数组存在
                if (!this.gameData.characters[characterIndex].thingsDone) {
                    this.gameData.characters[characterIndex].thingsDone = [];
                }
                
                // 添加做过的事
                this.gameData.characters[characterIndex].thingsDone.push(thingDoneData.thingDone);
                console.log('添加角色做过的事成功:', thingDoneData.name, thingDoneData.thingDone);
                return { success: true };
            } else {
                console.warn('角色不存在:', thingDoneData.name);
                return { success: false, error: '角色不存在' };
            }
        } catch (error) {
            console.error('添加角色做过的事错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加物品
    async addItem(itemData) {
        try {
            console.log('开始添加物品:', itemData);
            
            // 确保assets对象存在
            if (!this.gameData.assets) {
                this.gameData.assets = {
                    items: [],
                    property: [],
                    knowledge: []
                };
            }
            
            // 确保items数组存在
            if (!this.gameData.assets.items) {
                this.gameData.assets.items = [];
            }
            
            // 添加物品
            this.gameData.assets.items.push(itemData);
            console.log('添加物品成功:', itemData.name);
            return { success: true };
        } catch (error) {
            console.error('添加物品错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加财产
    async addProperty(propertyData) {
        try {
            console.log('开始添加财产:', propertyData);
            
            // 确保assets对象存在
            if (!this.gameData.assets) {
                this.gameData.assets = {
                    items: [],
                    property: [],
                    knowledge: []
                };
            }
            
            // 确保property数组存在
            if (!this.gameData.assets.property) {
                this.gameData.assets.property = [];
            }
            
            // 添加财产
            this.gameData.assets.property.push(propertyData);
            console.log('添加财产成功:', propertyData.name);
            return { success: true };
        } catch (error) {
            console.error('添加财产错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加知识
    async addKnowledge(knowledgeData) {
        try {
            console.log('开始添加知识:', knowledgeData);
            
            // 确保assets对象存在
            if (!this.gameData.assets) {
                this.gameData.assets = {
                    items: [],
                    property: [],
                    knowledge: []
                };
            }
            
            // 确保knowledge数组存在
            if (!this.gameData.assets.knowledge) {
                this.gameData.assets.knowledge = [];
            }
            
            // 添加知识
            this.gameData.assets.knowledge.push(knowledgeData);
            console.log('添加知识成功:', knowledgeData.name);
            return { success: true };
        } catch (error) {
            console.error('添加知识错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 移除物品
    async removeItem(itemName) {
        try {
            console.log('开始移除物品:', itemName);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.items) {
                return { success: false, error: '物品不存在' };
            }
            
            // 查找并移除物品
            const initialLength = this.gameData.assets.items.length;
            this.gameData.assets.items = this.gameData.assets.items.filter(item => item.name !== itemName);
            
            if (this.gameData.assets.items.length < initialLength) {
                console.log('移除物品成功:', itemName);
                return { success: true };
            } else {
                console.warn('物品不存在:', itemName);
                return { success: false, error: '物品不存在' };
            }
        } catch (error) {
            console.error('移除物品错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 移除财产
    async removeProperty(propertyName) {
        try {
            console.log('开始移除财产:', propertyName);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.property) {
                return { success: false, error: '财产不存在' };
            }
            
            // 查找并移除财产
            const initialLength = this.gameData.assets.property.length;
            this.gameData.assets.property = this.gameData.assets.property.filter(property => property.name !== propertyName);
            
            if (this.gameData.assets.property.length < initialLength) {
                console.log('移除财产成功:', propertyName);
                return { success: true };
            } else {
                console.warn('财产不存在:', propertyName);
                return { success: false, error: '财产不存在' };
            }
        } catch (error) {
            console.error('移除财产错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 移除知识
    async removeKnowledge(knowledgeName) {
        try {
            console.log('开始移除知识:', knowledgeName);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.knowledge) {
                return { success: false, error: '知识不存在' };
            }
            
            // 查找并移除知识
            const initialLength = this.gameData.assets.knowledge.length;
            this.gameData.assets.knowledge = this.gameData.assets.knowledge.filter(knowledge => knowledge.name !== knowledgeName);
            
            if (this.gameData.assets.knowledge.length < initialLength) {
                console.log('移除知识成功:', knowledgeName);
                return { success: true };
            } else {
                console.warn('知识不存在:', knowledgeName);
                return { success: false, error: '知识不存在' };
            }
        } catch (error) {
            console.error('移除知识错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加地点
    async addLocation(locationData) {
        try {
            console.log('开始添加地点:', locationData);
            
            // 确保assets对象存在
            if (!this.gameData.assets) {
                this.gameData.assets = {
                    items: [],
                    property: [],
                    knowledge: [],
                    locations: []
                };
            }
            
            // 确保locations数组存在
            if (!this.gameData.assets.locations) {
                this.gameData.assets.locations = [];
            }
            
            // 添加地点
            this.gameData.assets.locations.push(locationData);
            console.log('添加地点成功:', locationData.name);
            return { success: true };
        } catch (error) {
            console.error('添加地点错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新地点
    async updateLocation(locationData) {
        try {
            console.log('开始更新地点:', locationData);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.locations) {
                return { success: false, error: '地点不存在' };
            }
            
            // 查找地点
            const locationIndex = this.gameData.assets.locations.findIndex(location => location.name === locationData.name);
            
            if (locationIndex >= 0) {
                // 更新地点
                this.gameData.assets.locations[locationIndex] = {
                    ...this.gameData.assets.locations[locationIndex],
                    ...locationData
                };
                console.log('更新地点成功:', locationData.name);
                return { success: true };
            } else {
                console.warn('地点不存在:', locationData.name);
                return { success: false, error: '地点不存在' };
            }
        } catch (error) {
            console.error('更新地点错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 移除地点
    async removeLocation(locationName) {
        try {
            console.log('开始移除地点:', locationName);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.locations) {
                return { success: false, error: '地点不存在' };
            }
            
            // 查找并移除地点
            const initialLength = this.gameData.assets.locations.length;
            this.gameData.assets.locations = this.gameData.assets.locations.filter(location => location.name !== locationName);
            
            if (this.gameData.assets.locations.length < initialLength) {
                console.log('移除地点成功:', locationName);
                return { success: true };
            } else {
                console.warn('地点不存在:', locationName);
                return { success: false, error: '地点不存在' };
            }
        } catch (error) {
            console.error('移除地点错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新物品
    async updateItem(itemData) {
        try {
            console.log('开始更新物品:', itemData);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.items) {
                return { success: false, error: '物品不存在' };
            }
            
            // 查找物品
            const itemIndex = this.gameData.assets.items.findIndex(item => item.name === itemData.name);
            
            if (itemIndex >= 0) {
                // 更新物品
                this.gameData.assets.items[itemIndex] = {
                    ...this.gameData.assets.items[itemIndex],
                    ...itemData
                };
                console.log('更新物品成功:', itemData.name);
                return { success: true };
            } else {
                console.warn('物品不存在:', itemData.name);
                return { success: false, error: '物品不存在' };
            }
        } catch (error) {
            console.error('更新物品错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新财产
    async updateProperty(propertyData) {
        try {
            console.log('开始更新财产:', propertyData);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.property) {
                return { success: false, error: '财产不存在' };
            }
            
            // 查找财产
            const propertyIndex = this.gameData.assets.property.findIndex(property => property.name === propertyData.name);
            
            if (propertyIndex >= 0) {
                // 更新财产
                this.gameData.assets.property[propertyIndex] = {
                    ...this.gameData.assets.property[propertyIndex],
                    ...propertyData
                };
                console.log('更新财产成功:', propertyData.name);
                return { success: true };
            } else {
                console.warn('财产不存在:', propertyData.name);
                return { success: false, error: '财产不存在' };
            }
        } catch (error) {
            console.error('更新财产错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新知识
    async updateKnowledge(knowledgeData) {
        try {
            console.log('开始更新知识:', knowledgeData);
            
            // 确保assets对象存在
            if (!this.gameData.assets || !this.gameData.assets.knowledge) {
                return { success: false, error: '知识不存在' };
            }
            
            // 查找知识
            const knowledgeIndex = this.gameData.assets.knowledge.findIndex(knowledge => knowledge.name === knowledgeData.name);
            
            if (knowledgeIndex >= 0) {
                // 更新知识
                this.gameData.assets.knowledge[knowledgeIndex] = {
                    ...this.gameData.assets.knowledge[knowledgeIndex],
                    ...knowledgeData
                };
                console.log('更新知识成功:', knowledgeData.name);
                return { success: true };
            } else {
                console.warn('知识不存在:', knowledgeData.name);
                return { success: false, error: '知识不存在' };
            }
        } catch (error) {
            console.error('更新知识错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取当前游戏数据
    getGameData() {
        return this.gameData;
    }

    // 获取成就数据
    getAchievementsData() {
        return this.achievementsData;
    }

    // 重置游戏数据
    async resetGameData() {
        try {
            this.gameData = this.dataManager.getDefaultData();
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
            }
            await this.saveGameData();
            console.log('游戏数据已重置');
            return { success: true };
        } catch (error) {
            console.error('重置游戏数据错误:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取引擎状态
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            dataLoaded: Object.keys(this.gameData).length > 0,
            achievementsLoaded: Object.keys(this.achievementsData).length > 0,
            dependencies: {
                dataManager: this.dataManager !== null,
                responseParser: this.responseParser !== null
            }
        };
    }
}

// 创建全局引擎实例
const GameEngineInstance = new GameEngine();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameEngine,
        GameEngineInstance
    };
}

// 全局变量
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
    window.GameEngineInstance = GameEngineInstance;
}