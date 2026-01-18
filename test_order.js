// 简单测试脚本，用于验证语义中间层的输出顺序

// 模拟 semanticInterpreter 类
class SemanticInterpreter {
    // 景深级别解释映射
    static depthLevelExplanations = {
        1: {
            definition: "景深1级：宏观描述级别",
            meaning: "你应该使用宏观的描述方式，关注整体场景和氛围，避免过多细节。适合用于场景切换或概览描述。"
        },
        3: {
            definition: "景深3级：平衡描述级别",
            meaning: "你应该使用平衡的描述方式，既有整体场景的介绍，也有适当的细节描写。适合大多数常规场景。"
        }
    };
    
    // 故事节拍解释映射
    static storyBeatExplanations = {
        "起": {
            definition: "故事节拍'起'：故事开端阶段",
            meaning: "这是故事的开端，你应该专注于背景介绍、角色引入和场景搭建。保持神秘，让玩家自己挖掘世界的奥秘。叙事风格应该平稳，逐步引入世界观。建议占整个节拍循环字数的20%。"
        }
    };
    
    // 将data.json转换为自然语言
    static convertDataToNaturalLanguage(dataContent) {
        try {
            // 解析JSON数据
            const data = typeof dataContent === 'string' ? JSON.parse(dataContent) : dataContent;
            
            let naturalLanguage = '';
            
            // 添加当前时间
            if (data.currentTime) {
                naturalLanguage += `===当前时间===
定义：游戏内的当前时间
意义：影响场景氛围、角色行为和事件发生时机
值：${data.currentTime}\n\n`;
            }
            
            // 添加叙事信息 - 按照节拍-节拍字数-景深-世界观的顺序
            if (data.narrative) {
                const { storyBeat, beatStats, currentBeatCycle, totalWords, currentCycleWords, depthLevel } = data.narrative;
                
                // 1. 故事节拍
                if (storyBeat) {
                    naturalLanguage += '===故事节拍===';
                    const beatExplanation = this.storyBeatExplanations[storyBeat] || {
                        definition: `故事节拍'${storyBeat}'：自定义节拍`,
                        meaning: `你应该根据当前故事需要调整叙事风格。`
                    };
                    naturalLanguage += `\n\n${beatExplanation.definition}\n${beatExplanation.meaning}`;
                    naturalLanguage += '\n\n';
                }
                
                // 2. 节拍字数相关信息
                if (totalWords !== undefined || currentCycleWords !== undefined || currentBeatCycle || (beatStats && beatStats.current)) {
                    naturalLanguage += '===节拍字数===';
                    
                    if (totalWords !== undefined) {
                        naturalLanguage += `\n\n定义：故事总字数
意义：了解故事整体长度
值：${totalWords}字`;
                    }
                    
                    if (currentCycleWords !== undefined) {
                        naturalLanguage += `\n\n定义：当前循环的字数
意义：控制当前循环的叙事长度，避免偏离节拍字数建议
值：${currentCycleWords}字`;
                    }
                    
                    if (currentBeatCycle) {
                        naturalLanguage += `\n\n定义：当前是第几个'起-承-转-合'循环
意义：了解故事整体进度，一个完整循环建议字数为1-3万字
值：第${currentBeatCycle}轮循环`;
                    }
                    
                    if (beatStats && beatStats.current) {
                        naturalLanguage += `\n\n定义：当前和之前的节拍计数
意义：帮助把握故事节奏，确保各节拍平衡
值：`;
                        const { 起, 承, 转, 合 } = beatStats.current;
                        naturalLanguage += `起${起}次，承${承}次，转${转}次，合${合}次`;
                    }
                    
                    naturalLanguage += '\n\n';
                }
                
                // 3. 景深级别
                if (depthLevel) {
                    naturalLanguage += '===景深级别===';
                    const depthLevelNum = parseInt(depthLevel);
                    const depthExplanation = this.depthLevelExplanations[depthLevelNum] || {
                        definition: `景深${depthLevel}级：自定义级别`,
                        meaning: `你应该根据当前场景需要调整描述详细程度。`
                    };
                    naturalLanguage += `\n\n${depthExplanation.definition}\n${depthExplanation.meaning}`;
                    naturalLanguage += '\n\n';
                }
                
                // 4. 世界观
                naturalLanguage += '===世界观===';
                naturalLanguage += `\n\n定义：游戏世界的基本设定和背景
意义：构建游戏世界的基础框架，影响所有叙事内容
值：当前游戏世界是一个神秘的世界，时间设定在1925年，充满了未知的奥秘和探索空间。保持神秘，让玩家自己挖掘世界的真相。`;
                naturalLanguage += '\n\n';
            }
            
            // 5. 事件列表
            if (data.events && data.events.length > 0) {
                naturalLanguage += '===事件记录===';
                naturalLanguage += `\n定义：当前发生的事件列表
意义：将这些事件自然融入叙事，影响故事发展
\n`;
                data.events.forEach((event, index) => {
                    naturalLanguage += `${index + 1}. ${event}\n`;
                });
                naturalLanguage += '\n';
            }
            
            // 6. 伏笔列表
            if (data.foreshadowings && data.foreshadowings.length > 0) {
                naturalLanguage += '===伏笔记录===';
                naturalLanguage += `\n定义：故事中的伏笔列表
意义：保持叙事的连贯性和神秘感，在适当的时候呼应这些伏笔
\n`;
                data.foreshadowings.forEach((foreshadowing, index) => {
                    naturalLanguage += `${index + 1}. ${foreshadowing}\n`;
                });
                naturalLanguage += '\n';
            }
            
            // 7. 角色信息
            if (data.characters && data.characters.length > 0) {
                naturalLanguage += '===角色信息===';
                data.characters.forEach(character => {
                    naturalLanguage += `\n\n角色名称：${character.name}`;
                    
                    if (character.memoryPoints) {
                        naturalLanguage += `\n定义：角色的核心特征
意义：塑造鲜明的角色形象，这是角色最突出的特点
值：${character.memoryPoints}`;
                    }
                    
                    if (character.description) {
                        naturalLanguage += `\n定义：角色的详细描述
意义：理解角色的性格、行为方式和价值观
值：${character.description}`;
                    }
                    
                    if (character.template) {
                        naturalLanguage += `\n定义：角色的性格模板
意义：影响角色的思维模式和行为方式
值：${character.template}`;
                    }
                    
                    if (character.relationship) {
                        naturalLanguage += `\n定义：角色与玩家的关系
意义：影响互动方式和对话语气
值：${character.relationship}`;
                    }
                    
                    if (character.thingsDone && character.thingsDone.length > 0) {
                        naturalLanguage += `\n定义：角色的行为记录
意义：保持角色行为的一致性和连贯性
值：`;
                        character.thingsDone.forEach((thing, index) => {
                            naturalLanguage += `\n  ${index + 1}. ${thing}`;
                        });
                    }
                });
                naturalLanguage += '\n\n';
            }
            
            // 8. 游戏资产信息
            if (data.assets) {
                naturalLanguage += '===游戏资产===';
                
                // 物品
                if (data.assets.items && data.assets.items.length > 0) {
                    naturalLanguage += `\n\n定义：游戏中的物品列表
意义：这些物品可以被玩家使用或互动，影响游戏进程
值：`;
                    data.assets.items.forEach((item, index) => {
                        naturalLanguage += `\n  ${index + 1}. ${item}`;
                    });
                }
                
                // 财产
                if (data.assets.property && data.assets.property.length > 0) {
                    naturalLanguage += `\n\n定义：游戏中的财产列表
意义：这些财产代表玩家的资源和地位
值：`;
                    data.assets.property.forEach((prop, index) => {
                        naturalLanguage += `\n  ${index + 1}. ${prop}`;
                    });
                }
                
                // 知识
                if (data.assets.knowledge && data.assets.knowledge.length > 0) {
                    naturalLanguage += `\n\n定义：游戏中的知识列表
意义：这些知识代表玩家对世界的了解程度，影响解谜和决策
值：`;
                    data.assets.knowledge.forEach((knowledge, index) => {
                        naturalLanguage += `\n  ${index + 1}. ${knowledge}`;
                    });
                }
                
                // 地点
                if (data.assets.locations && data.assets.locations.length > 0) {
                    naturalLanguage += `\n\n定义：游戏中的地点列表
意义：这些地点是玩家可以探索的区域，每个地点都有独特的特征
值：`;
                    data.assets.locations.forEach((location, index) => {
                        naturalLanguage += `\n  ${index + 1}. ${location}`;
                    });
                }
                
                naturalLanguage += '\n\n';
            }
            
            return naturalLanguage.trim();
        } catch (error) {
            console.error('将数据转换为自然语言失败:', error);
            return '';
        }
    }
}

// 测试数据
const testData = {
  "currentTime": "1925-12-26 04:00:00",
  "narrative": {
    "depthLevel": "3",
    "storyBeat": "起",
    "beatStats": {
      "current": {
        "起": 0,
        "承": 0,
        "转": 0,
        "合": 0
      }
    },
    "currentBeatCycle": 1,
    "totalWords": 0,
    "currentCycleWords": 0
  },
  "events": ["事件1: 神秘的钟声响起"],
  "foreshadowings": ["伏笔1: 墙上的古老地图似乎隐藏着什么秘密"],
  "characters": [
    {
      "name": "特雷",
      "memoryPoints": "头顶插着一个巨大的齿轮。这是一种基于神秘学的自我显化，而非某种痛苦的人体改造。",
      "description": "对所有人都很友好的向导。不喜欢强制玩家行动或将难题抛给玩家。",
      "template": "蝶",
      "relationship": "新手引导员"
    }
  ],
  "assets": {
    "items": ["神秘的钥匙"],
    "property": ["一间小木屋"],
    "knowledge": ["古老的符文知识"],
    "locations": ["神秘的森林", "废弃的城堡"]
  }
};

// 执行测试
console.log("=== 测试语义中间层输出顺序 ===");
const result = SemanticInterpreter.convertDataToNaturalLanguage(testData);
console.log(result);

// 验证输出顺序
console.log("\n=== 验证输出顺序 ===");
const sections = result.split("===");
console.log("输出的节顺序:");
sections.forEach(section => {
    const trimmed = section.trim();
    if (trimmed && !trimmed.startsWith("定义:")) {
        console.log(`- ${trimmed.split("\n")[0]}`);
    }
});