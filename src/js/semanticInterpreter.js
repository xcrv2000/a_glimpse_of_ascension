// 语义中间层模块 - 将结构化数据转换为自然语言
class SemanticInterpreter {
    // 景深级别解释映射
    static depthLevelExplanations = {
        1: "当前景深级别为1级（共5级，宏观描述级别），建议使用宏观的描述方式，关注整体场景和氛围，避免过多细节，适合用于场景切换或概览描述。",
        2: "当前景深级别为2级（共5级，中宏观描述级别），建议使用中宏观的描述方式，仍以整体场景为主，但可以适当加入一些关键细节，适合用于过渡场景。",
        3: "当前景深级别为3级（共5级，平衡描述级别），建议使用平衡的描述方式，既有整体场景的介绍，也有适当的细节描写，适合大多数常规场景。",
        4: "当前景深级别为4级（共5级，中微观描述级别），建议使用中微观的描述方式，关注特定元素和情感细节，增强代入感，适合用于紧张或重要场景。",
        5: "当前景深级别为5级（共5级，微观描述级别），建议使用微观的描述方式，聚焦于非常具体的细节和情感，创造强烈的沉浸感，适合用于高潮或情感强烈的场景。"
    };
    
    // 故事节拍解释映射
    static storyBeatExplanations = {
        "起": "当前处于故事节拍'起'，即故事开端阶段。这是故事循环的开端，你应该专注于背景介绍、角色引入和场景搭建。保持神秘，让玩家自己挖掘世界的奥秘。叙事风格应该平稳，逐步引入世界观。",
        "承": "当前处于故事节拍'承'，即情节发展阶段。这是情节发展阶段，你应该推进故事发展，引入冲突，铺设伏笔。叙事风格应该逐渐增强张力，为后续转折做准备。",
        "转": "当前处于故事节拍'转'，即剧情转折阶段。这是剧情转折阶段，你应该制造戏剧性的转折，推向故事高潮，激化冲突。叙事风格应该紧凑有力，充满张力和悬念。",
        "合": "当前处于故事节拍'合'，即故事结局阶段。这是故事循环结局阶段，你应该收束故事线，解决冲突，升华主题。叙事风格应该沉稳有力，给玩家带来满足感和反思。",
        "完结": "当前处于故事节拍'完结'，即整个故事的最终结局。你应该对整个故事进行总结，回顾重要情节和主题，给玩家一个完整的收尾。叙事风格应该庄重、感人，强调故事的核心意义和情感共鸣。",
        "后日谈": "当前处于故事节拍'后日谈'，即故事主线结束后的补充内容。你应该展示角色们的后续生活，揭示一些未完全解答的谜团，或者提供故事世界的后续发展。叙事风格应该轻松、温馨，给玩家一种余韵悠长的感觉。"
    };
    
    // 将data.json转换为自然语言
    static convertDataToNaturalLanguage(dataContent) {
        try {
            // 解析JSON数据
            const data = typeof dataContent === 'string' ? JSON.parse(dataContent) : dataContent;
            
            let naturalLanguage = '';
            
            // 添加叙事信息 - 按照节拍(含字数信息)-景深-世界观-游戏内时间-事件的顺序
            if (data.narrative) {
                const { storyBeat, beatStats, currentBeatCycle, totalWords, currentCycleWords, depthLevel } = data.narrative;
                
                // 1. 故事节拍和节拍字数相关信息合并
                naturalLanguage += '===叙事节奏===';

                // 节拍字数相关信息
                if (totalWords !== undefined) {
                    naturalLanguage += `\n\n故事总字数为 ${totalWords} 字。`;
                }
                
                if (currentBeatCycle) {
                    naturalLanguage += `\n\n当前是第 ${currentBeatCycle} 个起承转合循环。`;
                }

                if (currentCycleWords !== undefined) {
                    naturalLanguage += `\n\n当前循环的字数为 ${currentCycleWords} 字。`;
                }
                                
                
                // 故事节拍
                if (storyBeat) {
                    const beatExplanation = this.storyBeatExplanations[storyBeat] || 
                        `当前处于故事节拍'${storyBeat}'，你应该根据当前故事需要调整叙事风格。`;
                    naturalLanguage += `\n\n${beatExplanation}`;
                }
                
                
                
                naturalLanguage += '\n\n';
                
                // 2. 景深级别
                if (depthLevel) {
                    naturalLanguage += '===景深级别===';
                    const depthLevelNum = parseInt(depthLevel);
                    const depthExplanation = this.depthLevelExplanations[depthLevelNum] || 
                        `当前景深级别为${depthLevel}级，你应该根据当前场景需要调整描述详细程度。1为最宏观，5为最微观`;
                    naturalLanguage += `\n\n${depthExplanation}`;
                    naturalLanguage += '\n\n';
                }
                
                // 3. 世界观
                naturalLanguage += '===游戏世界状态===';
                naturalLanguage += '\n\n';
            }
            
            // 4. 游戏内时间 - 放到世界观后面，事件列表前面
            if (data.currentTime) {
                naturalLanguage += `故事开始于1925年12月26日。当前游戏时间为 ${data.currentTime}。\n\n`;
            }
            
            // 5. 成就系统 - 游戏内时间后，事件列表前
            // 无论是否有成就数据，都显示成就系统部分
            naturalLanguage += '===成就系统===';
            
            let completed = [];
            
            if (data.achievements) {
                const achievements = data.achievements.achievements || [];
                const completedAchievements = data.achievements.completedAchievements || [];
                
                // 计算已完成的成就
                completed = (completedAchievements && completedAchievements.length > 0 ? 
                    // 确保completedAchievements中的元素都是字符串
                    completedAchievements.map(item => typeof item === 'string' ? item : (item.name || '')) : 
                    (achievements && achievements.length > 0 ? achievements.filter(achievement => achievement.isCompleted).map(a => a.name) : []));
                
                // 过滤掉空字符串
                completed = completed.filter(item => typeof item === 'string' && item.trim() !== '');
                
                if (completed.length > 0) {
                    naturalLanguage += `\n\n玩家当前已达成的成就有：`;
                    completed.forEach((achievementName, index) => {
                        const achievement = achievements ? achievements.find(a => a.name === achievementName) : null;
                        if (achievement) {
                            const isHidden = achievement.isHidden || false;
                            const achievementType = achievementName.includes('伟业') ? '伟业类' : (isHidden ? '隐藏' : '可见');
                            naturalLanguage += `\n${index + 1}. ${achievementName}（${achievementType}）：${achievement.description}`;
                        } else {
                            naturalLanguage += `\n${index + 1}. ${achievementName}`;
                        }
                    });
                } else {
                    naturalLanguage += `\n\n玩家当前尚未达成任何成就。`;
                }
            } else {
                naturalLanguage += `\n\n玩家当前尚未达成任何成就。`;
            }
            
            // 伟业类成就特殊处理
            const 伟业Achievements = completed.filter(name => name.includes('伟业'));
            if (伟业Achievements.length > 0) {
                naturalLanguage += `\n\n提示：玩家已达成伟业类成就，故事主体可能即将结束，应当开始考虑如何给故事结尾。`;
            }
            
            // 成就系统说明 - 无论是否有成就数据都显示
            naturalLanguage += `\n\n成就系统说明：`;
            naturalLanguage += `\n- 成就分为可见和隐藏两种类型，隐藏成就是对玩家自主探索的奖励`;
            naturalLanguage += `\n- 伟业类成就被完成时，应当设计隆重的叙事反馈，强调成就的重要性`;
            naturalLanguage += `\n- 成就的本质是一种学位，一种知识的证明，完成伟业的过程是艺术化的答辩过程。注意不要告诉玩家成就的达成标准`;
            naturalLanguage += `\n- 当玩家达成伟业类成就时，整个故事的主体就结束了，应当开始考虑如何给故事结尾`;
            naturalLanguage += `\n\n`;
            
            // 6. 事件列表
            if (data.events && data.events.length > 0) {
                naturalLanguage += '===事件记录===';
                naturalLanguage += `\n当前正在发生的事件有：\n`;
                data.events.forEach((event, index) => {
                    if (event.name && event.description) {
                        naturalLanguage += `${index + 1}. ${event.name}：${event.description}`;
                        if (event.expectedEndTime) {
                            naturalLanguage += `（预计结束时间：${event.expectedEndTime}）`;
                        }
                        naturalLanguage += '\n';
                    } else if (event.name) {
                        naturalLanguage += `${index + 1}. ${event.name}\n`;
                    } else {
                        naturalLanguage += `${index + 1}. ${JSON.stringify(event)}\n`;
                    }
                });
            }
            
            // 6. 伏笔列表
            if (data.foreshadowings && data.foreshadowings.length > 0) {
                naturalLanguage += '===伏笔记录===';
                naturalLanguage += `\n故事中的伏笔有：\n`;
                data.foreshadowings.forEach((foreshadowing, index) => {
                    if (foreshadowing.name && foreshadowing.description) {
                        naturalLanguage += `${index + 1}. ${foreshadowing.name}：${foreshadowing.description}`;
                        if (foreshadowing.importance) {
                            naturalLanguage += `（重要程度：${foreshadowing.importance}）`;
                        }
                        naturalLanguage += '\n';
                    } else if (foreshadowing.name) {
                        naturalLanguage += `${index + 1}. ${foreshadowing.name}\n`;
                    } else {
                        naturalLanguage += `${index + 1}. ${JSON.stringify(foreshadowing)}\n`;
                    }
                });
            }
            
            // 7. 角色信息
            if (data.characters && data.characters.length > 0) {
                naturalLanguage += '===角色信息===';
                data.characters.forEach(character => {
                    naturalLanguage += `\n\n角色名称：${character.name}`;
                    
                    if (character.memoryPoints) {
                        naturalLanguage += `\n${character.name}的记忆点：${character.memoryPoints}`;
                    }
                    
                    if (character.description) {
                        naturalLanguage += `\n${character.name}的描述：${character.description}`;
                    }
                    
                    if (character.template) {
                        naturalLanguage += `\n${character.name}的性格模板为：${character.template}。参考世界观部分的characterTemplates进行渲染。`;
                    }
                    
                    if (character.relationship) {
                        naturalLanguage += `\n${character.name}与玩家的关系：${character.relationship}`;
                    }
                    
                    if (character.thingsDone && character.thingsDone.length > 0) {
                        naturalLanguage += `\n${character.name}已做之事：`;
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
                    naturalLanguage += `\n\n游戏中值得记录的物品有：`;
                    data.assets.items.forEach((item, index) => {
                        if (item.name && item.description) {
                            naturalLanguage += `\n  ${index + 1}. ${item.name}：${item.description}`;
                            if (item.quantity) {
                                naturalLanguage += `（数量：${item.quantity}）`;
                            }
                        } else if (item.name) {
                            naturalLanguage += `\n  ${index + 1}. ${item.name}`;
                        } else {
                            naturalLanguage += `\n  ${index + 1}. ${JSON.stringify(item)}`;
                        }
                    });
                }
                
                // 财产
                if (data.assets.property && data.assets.property.length > 0) {
                    naturalLanguage += `\n\n游戏中值得记录的财产有：`;
                    data.assets.property.forEach((prop, index) => {
                        if (prop.name && prop.description) {
                            naturalLanguage += `\n  ${index + 1}. ${prop.name}：${prop.description}`;
                        } else if (prop.name) {
                            naturalLanguage += `\n  ${index + 1}. ${prop.name}`;
                        } else {
                            naturalLanguage += `\n  ${index + 1}. ${JSON.stringify(prop)}`;
                        }
                    });
                }
                
                // 知识
                if (data.assets.knowledge && data.assets.knowledge.length > 0) {
                    naturalLanguage += `\n\n游戏中值得记录的知识有：`;
                    data.assets.knowledge.forEach((knowledge, index) => {
                        if (knowledge.name && knowledge.description) {
                            naturalLanguage += `\n  ${index + 1}. ${knowledge.name}：${knowledge.description}`;
                        } else if (knowledge.name) {
                            naturalLanguage += `\n  ${index + 1}. ${knowledge.name}`;
                        } else {
                            naturalLanguage += `\n  ${index + 1}. ${JSON.stringify(knowledge)}`;
                        }
                    });
                }
                
                // 地点
                if (data.assets.locations && data.assets.locations.length > 0) {
                    naturalLanguage += `\n\n游戏中值得记录的地点有：`;
                    data.assets.locations.forEach((location, index) => {
                        if (location.name && location.description) {
                            naturalLanguage += `\n  ${index + 1}. ${location.name}：${location.description}`;
                        } else if (location.name) {
                            naturalLanguage += `\n  ${index + 1}. ${location.name}`;
                        } else {
                            naturalLanguage += `\n  ${index + 1}. ${JSON.stringify(location)}`;
                        }
                    });
                }
                
                naturalLanguage += '\n\n';
            }
            
            // 确保返回非空字符串
            return naturalLanguage.trim() || '游戏数据转换为自然语言时未生成内容';
        } catch (error) {
            console.error('将数据转换为自然语言失败:', error);
            return `数据转换失败: ${error.message}`;
        }
    }
    
    // 从文件加载data.json并转换为自然语言
    static async loadAndConvertData() {
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const dataPath = `${basePath}/data/data.json`;
            const dataResponse = await fetch(dataPath);
            
            if (dataResponse.ok) {
                const dataContent = await dataResponse.text();
                return this.convertDataToNaturalLanguage(dataContent);
            }
            
            return '';
        } catch (error) {
            console.error('加载数据文件失败:', error);
            return '';
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SemanticInterpreter;
} else if (typeof window !== 'undefined') {
    window.SemanticInterpreter = SemanticInterpreter;
}

// 确保在 Node.js 环境中也能访问到 SemanticInterpreter
global.SemanticInterpreter = SemanticInterpreter;