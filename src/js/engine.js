// 游戏引擎核心模块
class GameEngine {
    constructor() {
        this.dataManager = null;
        this.responseParser = null;
        this.isInitialized = false;
        this.gameData = {};
        this.achievementsData = {}; // 成就数据，不会随新游戏重置
        this.depthHistory = []; // 存储最近5轮的景深数据
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
                    request.action === 'update' && request.path === 'metadata.currentTime'
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
                    'metadata.currentTime',
                    newTime
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
            const validation = this.responseParser.validateRequests(requests);
            
            if (validation.errors.length > 0) {
                console.warn('数据请求验证错误:', validation.errors);
            }
            
            // 处理有效的请求
            const validRequests = validation.validRequests;
            
            for (const request of validRequests) {
                await this.processSingleRequest(request);
            }
            
            // 保存更新后的数据
            await this.saveGameData();
            
            console.log('数据请求处理完成');
            return {
                success: true,
                processedCount: validRequests.length,
                errors: validation.errors.length
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
            } else if (request.action === 'update') {
                // 处理节拍操作
                if (request.path === 'narrative.storyBeatOperation') {
                    this.processStoryBeatOperation(request.value);
                } else if (request.path === 'narrative.depthLevel') {
                    // 处理景深等级更新
                    this.processDepthLevel(request.value);
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
                    currentTime: this.gameData.metadata?.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
                };
            } else {
                // 不存在同名事件，添加新事件
                console.log('添加新事件:', eventData.name);
                const newEvent = {
                    ...eventData,
                    currentTime: this.gameData.metadata?.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
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
                    currentTime: this.gameData.metadata?.currentTime || new Date().toISOString().slice(0, 19).replace('T', ' ')
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

    // 检查事件时间状态
    async checkEventTimeStatus() {
        try {
            console.log('开始检查事件时间状态');
            
            // 确保events数组存在
            if (!this.gameData.events) {
                this.gameData.events = [];
                return;
            }
            
            const currentTime = this.gameData.metadata?.currentTime;
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

    // 处理故事节拍操作
    processStoryBeatOperation(operation) {
        try {
            console.log('处理故事节拍操作:', operation);
            
            // 检查是否已经在后日谈
            const currentBeat = this.gameData.narrative?.storyBeat || '起';
            if (currentBeat === '后日谈') {
                console.log('已在后日谈，节拍操作无效');
                return currentBeat;
            }
            
            // 处理完结操作（在任何节拍都有效）
            if (operation === '完结') {
                // 直接进入后日谈
                const newBeat = '后日谈';
                this.gameData = this.dataManager.updateDataByPath(
                    this.gameData,
                    'narrative.storyBeat',
                    newBeat
                );
                // 在后日谈中，当前时间变为"后日谈"
                this.gameData = this.dataManager.updateDataByPath(
                    this.gameData,
                    'metadata.currentTime',
                    '后日谈'
                );
                console.log(`故事节拍已完结: ${currentBeat} → ${newBeat}`);
                return newBeat;
            }
            
            // 检查是否在终幕
            if (currentBeat === '终幕') {
                console.log('已在终幕，节拍操作无效');
                return currentBeat;
            }
            
            // 定义故事节拍顺序
            const storyBeatOrder = ['起', '承', '转', '合'];
            const currentIndex = storyBeatOrder.indexOf(currentBeat);
            
            let newBeat = currentBeat;
            
            if (operation === '推进' || operation === '推进到下一节拍') {
                // 推进到下一节拍
                if (currentIndex < storyBeatOrder.length - 1) {
                    newBeat = storyBeatOrder[currentIndex + 1];
                } else {
                    // 已经是最后一节拍，检查是否在当前游戏中达成伟业
                    if (this.gameData.narrative?.hasAchievedGreatnessInCurrentGame) {
                        // 在当前游戏中达成伟业，进入后日谈
                        console.log('在当前游戏中达成伟业，当前节拍循环结束，进入后日谈');
                        newBeat = '后日谈';
                        // 在后日谈中，当前时间变为"后日谈"
                        this.gameData = this.dataManager.updateDataByPath(
                            this.gameData,
                            'metadata.currentTime',
                            '后日谈'
                        );
                    } else {
                        // 未在当前游戏中达成伟业，重置为'起'，开始新的循环
                        newBeat = storyBeatOrder[0];
                        
                        // 开始新的节拍循环
                        this.startNewBeatCycle();
                    }
                }
            } else if (operation === '维持' || operation === '维持在当前节拍') {
                // 维持当前节拍
                newBeat = currentBeat;
            } else if (storyBeatOrder.includes(operation)) {
                // 直接指定节拍
                newBeat = operation;
            }
            
            // 检查是否需要进入终幕
            newBeat = this.checkIfNeedEnterFinalAct(newBeat);
            
            // 更新故事节拍
            this.gameData = this.dataManager.updateDataByPath(
                this.gameData,
                'narrative.storyBeat',
                newBeat
            );
            
            console.log(`故事节拍已${operation === '推进' || operation === '推进到下一节拍' ? '推进' : '维持'}: ${currentBeat} → ${newBeat}`);
            return newBeat;
        } catch (error) {
            console.error('处理故事节拍操作错误:', error);
            return this.gameData.narrative?.storyBeat || '起';
        }
    }

    // 检查是否需要进入终幕
    checkIfNeedEnterFinalAct(currentBeat) {
        // 检查是否已经在终幕或后日谈
        if (currentBeat === '终幕' || currentBeat === '后日谈') {
            return currentBeat;
        }
        
        // 检查时间线是否到1929年
        const currentTime = this.gameData.metadata?.currentTime;
        if (currentTime && typeof currentTime === 'string' && currentTime !== '后日谈') {
            const yearMatch = currentTime.match(/^(\d{4})-/);
            if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                if (year >= 1929) {
                    console.log('时间线到1929年，进入终幕');
                    return '终幕';
                }
            }
        }
        
        // 检查故事总字数是否超过30万字
        const totalWords = this.gameData.narrative?.totalWords || 0;
        if (totalWords >= 300000) {
            console.log('故事总字数超过30万字，进入终幕');
            return '终幕';
        }
        
        return currentBeat;
    }
    
    // 开始新的节拍循环
    startNewBeatCycle() {
        try {
            console.log('开始新的节拍循环');
            
            // 保存当前循环的统计数据到上一个循环
            if (this.gameData.narrative?.beatStats?.current) {
                this.gameData.narrative.beatStats.previous = { ...this.gameData.narrative.beatStats.current };
            }
            
            // 重置当前循环的统计数据
            this.gameData.narrative.beatStats.current = {
                '起': 0,
                '承': 0,
                '转': 0,
                '合': 0
            };
            
            // 重置当前循环字数
            this.gameData.narrative.currentCycleWords = 0;
            
            // 增加循环计数
            this.gameData.narrative.currentBeatCycle = 
                (this.gameData.narrative.currentBeatCycle || 0) + 1;
            
            console.log(`新的节拍循环开始，当前循环: ${this.gameData.narrative.currentBeatCycle}`);
        } catch (error) {
            console.error('开始新的节拍循环错误:', error);
        }
    }
    
    // 更新节拍字数统计
    updateBeatWordCount(wordCount) {
        try {
            console.log('更新节拍字数统计:', wordCount);
            
            // 获取当前节拍
            const currentBeat = this.gameData.narrative?.storyBeat || '起';
            
            // 更新当前节拍的字数
            if (this.gameData.narrative?.beatStats?.current) {
                this.gameData.narrative.beatStats.current[currentBeat] = 
                    (this.gameData.narrative.beatStats.current[currentBeat] || 0) + wordCount;
            }
            
            // 更新当前循环字数
            this.gameData.narrative.currentCycleWords = 
                (this.gameData.narrative.currentCycleWords || 0) + wordCount;
            
            // 更新总字数
            this.gameData.narrative.totalWords = 
                (this.gameData.narrative.totalWords || 0) + wordCount;
            
            console.log(`节拍字数统计更新：当前节拍[${currentBeat}]增加${wordCount}字`);
        } catch (error) {
            console.error('更新节拍字数统计错误:', error);
        }
    }
    
    // 处理景深等级
    processDepthLevel(value) {
        try {
            console.log('处理景深等级:', value);
            
            // 验证输入值
            let depth = parseInt(value);
            if (isNaN(depth) || depth < 1 || depth > 5) {
                console.warn('无效的景深等级值，使用默认值3:', value);
                depth = 3;
            }
            
            // 应用规则之前的原始值
            const originalDepth = depth;
            
            // 规则1: 如果连续三轮出现相同，本轮将其修改为随机一个相邻的数
            if (this.depthHistory.length >= 2) {
                if (this.depthHistory[this.depthHistory.length - 1] === depth && 
                    this.depthHistory[this.depthHistory.length - 2] === depth) {
                    console.log('触发规则1: 连续三轮相同，修改为相邻数');
                    if (depth === 1) {
                        depth = 2; // 1只能增加到2
                    } else if (depth === 5) {
                        depth = 4; // 5只能减少到4
                    } else {
                        // 2-4可以随机增加或减少
                        depth = depth + (Math.random() > 0.5 ? 1 : -1);
                    }
                }
            }
            
            // 规则2: 如果出现1，本轮有5%几率将其修改为4，5%几率将其修改为5
            if (originalDepth === 1) {
                const random = Math.random();
                if (random < 0.05) {
                    console.log('触发规则2a: 1修改为4');
                    depth = 4;
                } else if (random < 0.1) {
                    console.log('触发规则2b: 1修改为5');
                    depth = 5;
                }
            }
            
            // 规则3: 如果上上轮是1，上一轮是4或5，本轮将其修改为3
            if (this.depthHistory.length >= 2) {
                const twoRoundsAgo = this.depthHistory[this.depthHistory.length - 2];
                const lastRound = this.depthHistory[this.depthHistory.length - 1];
                if (twoRoundsAgo === 1 && (lastRound === 4 || lastRound === 5)) {
                    console.log('触发规则3: 上上轮是1，上一轮是4或5，修改为3');
                    depth = 3;
                }
            }
            
            // 规则4: 10%几率将上一轮的数修改为一个随机相邻的数
            if (this.depthHistory.length >= 1 && Math.random() < 0.1) {
                console.log('触发规则4: 10%几率修改为相邻数');
                const lastDepth = this.depthHistory[this.depthHistory.length - 1];
                if (lastDepth === 1) {
                    depth = 2; // 1只能增加到2
                } else if (lastDepth === 5) {
                    depth = 4; // 5只能减少到4
                } else {
                    // 2-4可以随机增加或减少
                    depth = lastDepth + (Math.random() > 0.5 ? 1 : -1);
                }
            }
            
            // 确保景深等级始终在1-5之间
            depth = Math.max(1, Math.min(5, depth));
            
            // 更新景深历史记录
            this.depthHistory.push(depth);
            // 只保留最近5轮的数据
            if (this.depthHistory.length > 5) {
                this.depthHistory.shift();
            }
            
            // 更新游戏数据中的景深等级
            this.gameData = this.dataManager.updateDataByPath(
                this.gameData,
                'narrative.depthLevel',
                depth.toString()
            );
            
            console.log(`景深等级已更新: ${originalDepth} → ${depth}`);
            console.log('当前景深历史:', this.depthHistory);
            
            return depth;
        } catch (error) {
            console.error('处理景深等级错误:', error);
            return this.gameData.narrative?.depthLevel || 3;
        }
    }

    // 处理默认数据请求（当AI响应中没有数据请求时使用）
    async processDefaultDataRequests() {
        try {
            console.log('开始处理默认数据请求');
            
            // 检查是否已经设置了时间
            const hasTimeSet = this.gameData.metadata?.currentTime;
            
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
                    path: 'metadata.currentTime',
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
            const currentTimeStr = this.gameData.metadata?.currentTime || '1925-12-26 00:00:00';
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
            return this.gameData.metadata?.currentTime || '1925-12-26 00:00:00';
        }
    }
    
    // 保存游戏数据
    async saveGameData() {
        try {
            // 更新元数据
            this.gameData.metadata = {
                ...this.gameData.metadata,
                lastUpdated: new Date().toISOString()
            };
            
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
                    thingsDone: characterData.thingsDone || this.gameData.characters[existingCharacterIndex].thingsDone || []
                };
            } else {
                // 不存在同名角色，添加新角色
                console.log('添加新角色:', characterData.name);
                const newCharacter = {
                    ...characterData,
                    thingsDone: characterData.thingsDone || []
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
                    thingsDone: characterData.thingsDone || this.gameData.characters[existingCharacterIndex].thingsDone || []
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