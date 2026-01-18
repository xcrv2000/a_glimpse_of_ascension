// 叙事节奏控制器，负责管理游戏的叙事节奏、节拍和景深
class NarrativeRhythmController {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.depthHistory = []; // 存储最近5轮的景深数据
    }
    
    // 处理故事节拍操作
    processStoryBeatOperation(gameData, operation) {
        try {
            console.log('处理故事节拍操作:', operation);
            
            // 检查是否已经在后日谈（通过节拍或时间判断）
            const currentBeat = gameData.narrative?.storyBeat || '起';
            const currentTime = gameData.currentTime;
            
            // 如果当前节拍是后日谈，或者当前时间是后日谈，忽略所有节拍操作
            if (currentBeat === '后日谈' || currentTime === '后日谈') {
                console.log('已在后日谈，节拍操作无效');
                return { gameData, newBeat: currentBeat || '后日谈' };
            }
            
            // 处理完结操作（在任何节拍都有效，除了后日谈）
            if (operation === '完结') {
                // 直接进入后日谈
                const newBeat = '后日谈';
                gameData = this.dataManager.updateDataByPath(
                    gameData,
                    'narrative.storyBeat',
                    newBeat
                );
                // 在后日谈中，当前时间变为"后日谈"
                gameData = this.dataManager.updateDataByPath(
                    gameData,
                    'currentTime',
                    '后日谈'
                );
                console.log(`故事节拍已完结: ${currentBeat} → ${newBeat}`);
                return { gameData, newBeat };
            }
            
            // 检查是否在终幕
            if (currentBeat === '终幕') {
                console.log('已在终幕，节拍操作无效');
                return { gameData, newBeat: currentBeat };
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
                    if (gameData.narrative?.hasAchievedGreatnessInCurrentGame) {
                        // 在当前游戏中达成伟业，进入后日谈
                        console.log('在当前游戏中达成伟业，当前节拍循环结束，进入后日谈');
                        newBeat = '后日谈';
                        // 在后日谈中，当前时间变为"后日谈"
                        gameData = this.dataManager.updateDataByPath(
                            gameData,
                            'currentTime',
                            '后日谈'
                        );
                    } else {
                        // 未在当前游戏中达成伟业，重置为'起'，开始新的循环
                        newBeat = storyBeatOrder[0];
                        
                        // 开始新的节拍循环
                        gameData = this.startNewBeatCycle(gameData);
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
            newBeat = this.checkIfNeedEnterFinalAct(gameData, newBeat);
            
            // 更新故事节拍
            gameData = this.dataManager.updateDataByPath(
                gameData,
                'narrative.storyBeat',
                newBeat
            );
            
            console.log(`故事节拍已${operation === '推进' || operation === '推进到下一节拍' ? '推进' : '维持'}: ${currentBeat} → ${newBeat}`);
            return { gameData, newBeat };
        } catch (error) {
            console.error('处理故事节拍操作错误:', error);
            return { gameData, newBeat: gameData.narrative?.storyBeat || '起' };
        }
    }
    
    // 检查是否需要进入终幕
    checkIfNeedEnterFinalAct(gameData, currentBeat) {
        // 检查是否已经在终幕或后日谈
        if (currentBeat === '终幕' || currentBeat === '后日谈') {
            return currentBeat;
        }
        
        // 检查时间线是否到1929年
        const currentTime = gameData.currentTime;
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
        const totalWords = gameData.narrative?.totalWords || 0;
        if (totalWords >= 300000) {
            console.log('故事总字数超过30万字，进入终幕');
            return '终幕';
        }
        
        return currentBeat;
    }
    
    // 开始新的节拍循环
    startNewBeatCycle(gameData) {
        try {
            console.log('开始新的节拍循环');
            
            // 保存当前循环的统计数据到上一个循环
            if (gameData.narrative?.beatStats?.current) {
                gameData.narrative.beatStats.previous = { ...gameData.narrative.beatStats.current };
            }
            
            // 重置当前循环的统计数据
            gameData.narrative.beatStats.current = {
                '起': 0,
                '承': 0,
                '转': 0,
                '合': 0
            };
            
            // 重置当前循环字数
            gameData.narrative.currentCycleWords = 0;
            
            // 增加循环计数
            gameData.narrative.currentBeatCycle = 
                (gameData.narrative.currentBeatCycle || 0) + 1;
            
            console.log(`新的节拍循环开始，当前循环: ${gameData.narrative.currentBeatCycle}`);
            return gameData;
        } catch (error) {
            console.error('开始新的节拍循环错误:', error);
            return gameData;
        }
    }
    
    // 更新节拍字数统计
    updateBeatWordCount(gameData, wordCount) {
        try {
            console.log('更新节拍字数统计:', wordCount);
            
            // 获取当前节拍
            const currentBeat = gameData.narrative?.storyBeat || '起';
            
            // 更新当前节拍的字数
            if (gameData.narrative?.beatStats?.current) {
                gameData.narrative.beatStats.current[currentBeat] = 
                    (gameData.narrative.beatStats.current[currentBeat] || 0) + wordCount;
            }
            
            // 更新当前循环字数
            gameData.narrative.currentCycleWords = 
                (gameData.narrative.currentCycleWords || 0) + wordCount;
            
            // 更新总字数
            gameData.narrative.totalWords = 
                (gameData.narrative.totalWords || 0) + wordCount;
            
            console.log(`节拍字数统计更新：当前节拍[${currentBeat}]增加${wordCount}字`);
            
            // 检查是否需要根据字数自动推进节拍
            gameData = this.checkAutoBeatAdvance(gameData);
            
            return gameData;
        } catch (error) {
            console.error('更新节拍字数统计错误:', error);
            return gameData;
        }
    }
    
    // 检查是否需要根据字数自动推进节拍
    checkAutoBeatAdvance(gameData) {
        try {
            // 获取当前节拍和循环信息
            const currentBeat = gameData.narrative?.storyBeat || '起';
            const currentCycle = gameData.narrative?.currentBeatCycle || 1;
            const currentBeatWords = gameData.narrative?.beatStats?.current?.[currentBeat] || 0;
            
            // 定义不同循环阶段的字数阈值
            const thresholds = {
                // 第一个循环（cycle 1）
                1: {
                    '起': 2000,
                    '承': 4000,
                    '转': 3000,
                    '合': 1000
                },
                // 后续循环（cycle > 1）
                default: {
                    '起': 6000,
                    '承': 12000,
                    '转': 9000,
                    '合': 3000
                }
            };
            
            // 获取当前循环的阈值配置
            const currentThresholds = currentCycle === 1 ? thresholds[1] : thresholds.default;
            
            // 检查当前节拍是否达到字数阈值
            if (currentBeatWords >= currentThresholds[currentBeat]) {
                console.log(`当前节拍[${currentBeat}]字数${currentBeatWords}已达到阈值${currentThresholds[currentBeat]}，自动推进到下一节拍`);
                
                // 定义故事节拍顺序
                const storyBeatOrder = ['起', '承', '转', '合'];
                const currentIndex = storyBeatOrder.indexOf(currentBeat);
                
                let newBeat;
                if (currentIndex < storyBeatOrder.length - 1) {
                    // 不是最后一节拍，推进到下一节拍
                    newBeat = storyBeatOrder[currentIndex + 1];
                } else {
                    // 是最后一节拍（合），进入下一个循环的起
                    newBeat = '起';
                    // 开始新的节拍循环
                    gameData = this.startNewBeatCycle(gameData);
                }
                
                // 更新故事节拍
                gameData = this.dataManager.updateDataByPath(
                    gameData,
                    'narrative.storyBeat',
                    newBeat
                );
                
                console.log(`故事节拍已自动推进: ${currentBeat} → ${newBeat}`);
            }
            
            return gameData;
        } catch (error) {
            console.error('检查自动节拍推进错误:', error);
            return gameData;
        }
    }
    
    // 处理景深等级
    processDepthLevel(gameData, value) {
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
            gameData = this.dataManager.updateDataByPath(
                gameData,
                'narrative.depthLevel',
                depth.toString()
            );
            
            console.log(`景深等级已更新: ${originalDepth} → ${depth}`);
            console.log('当前景深历史:', this.depthHistory);
            
            return gameData;
        } catch (error) {
            console.error('处理景深等级错误:', error);
            return gameData;
        }
    }
}