// 游戏引擎核心模块
class GameEngine {
    constructor() {
        this.dataManager = null;
        this.responseParser = null;
        this.isInitialized = false;
        this.gameData = {};
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
            
            console.log('游戏数据加载成功:', this.gameData);
            return this.gameData;
        } catch (error) {
            console.error('加载游戏数据错误:', error);
            // 使用默认数据作为 fallback
            this.gameData = this.dataManager.getDefaultData();
            return this.gameData;
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
            
            // 处理数据请求
            if (parseResult.dataRequests && parseResult.dataRequests.length > 0) {
                await this.processDataRequests(parseResult.dataRequests);
            } else {
                // 如果没有数据请求，使用默认值（维持和上一轮对话相同）
                console.warn('没有数据请求，使用默认值（维持和上一轮对话相同）');
                await this.processDefaultDataRequests();
            }
            
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
            
            // 只处理update操作
            if (request.action === 'update') {
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

    // 处理故事节拍操作
    processStoryBeatOperation(operation) {
        try {
            console.log('处理故事节拍操作:', operation);
            
            // 定义故事节拍顺序
            const storyBeatOrder = ['起', '承', '转', '合'];
            const currentBeat = this.gameData.narrative?.storyBeat || '起';
            const currentIndex = storyBeatOrder.indexOf(currentBeat);
            
            let newBeat = currentBeat;
            
            if (operation === '推进' || operation === '推进到下一节拍') {
                // 推进到下一节拍
                if (currentIndex < storyBeatOrder.length - 1) {
                    newBeat = storyBeatOrder[currentIndex + 1];
                } else {
                    // 已经是最后一节拍，重置为'起'
                    newBeat = storyBeatOrder[0];
                }
            } else if (operation === '维持' || operation === '维持在当前节拍') {
                // 维持当前节拍
                newBeat = currentBeat;
            } else if (storyBeatOrder.includes(operation)) {
                // 直接指定节拍
                newBeat = operation;
            }
            
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
            
            // 使用默认值：维持节拍，使用上一轮的景深等级
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
            
            // 处理默认数据请求
            await this.processDataRequests(defaultRequests);
            
            console.log('默认数据请求处理完成');
            return { success: true };
        } catch (error) {
            console.error('处理默认数据请求错误:', error);
            return { success: false, error: error.message };
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

    // 获取当前游戏数据
    getGameData() {
        return this.gameData;
    }

    // 重置游戏数据
    async resetGameData() {
        try {
            this.gameData = this.dataManager.getDefaultData();
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
