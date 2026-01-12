// 调试面板模块
class DebugPanel {
    constructor() {
        this.panel = document.getElementById('debugPanel');
        this.init();
    }

    init() {
        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        // 切换调试面板显示/隐藏
        window.toggleDebugPanel = () => this.togglePanel();
        
        // 切换调试选项卡
        window.switchDebugTab = (tabId, event) => this.switchTab(tabId, event);
        
        // 执行引擎工具操作
        window.executeEngineTool = (action, path, value) => this.executeTool(action, path, value);
        
        // 执行时间设置操作
        window.executeTimeTool = () => this.executeTime();
        
        // 切换事件表单显示/隐藏
        window.toggleEventForm = () => this.toggleEventForm();
        
        // 执行事件操作
        window.executeEventTool = (action) => this.executeEvent(action);
        
        // 切换伏笔表单显示/隐藏
        window.toggleForeshadowingForm = () => this.toggleForeshadowingForm();
        
        // 执行伏笔操作
        window.executeForeshadowingTool = (action) => this.executeForeshadowing(action);
    }

    togglePanel() {
        if (this.panel.style.display === 'none') {
            this.panel.style.display = 'block';
        } else {
            this.panel.style.display = 'none';
        }
    }

    switchTab(tabId, event) {
        // 隐藏所有选项卡内容
        const tabContents = document.querySelectorAll('.debug-tab-content');
        tabContents.forEach(tab => {
            tab.style.display = 'none';
        });
        
        // 移除所有选项卡的活动状态
        const tabs = document.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 显示选中的选项卡内容
        document.getElementById(`${tabId}-tab`).style.display = 'block';
        
        // 设置选中选项卡为活动状态
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
        
        // 如果切换到引擎工具选项卡，更新游戏数据显示
        if (tabId === 'engine-tools') {
            this.updateGameDataDisplay();
        }
        
        // 如果切换到压缩故事选项卡，更新压缩故事显示
        if (tabId === 'compressed-story') {
            this.updateCompressedStoryDisplay();
        }
    }

    executeTool(action, path, value) {
        try {
            // 创建工具请求对象
            const toolRequest = {
                action: action,
                path: path,
                value: value
            };
            
            // 验证请求
            const validation = ResponseParser.validateRequest(toolRequest);
            if (!validation.valid) {
                alert('操作无效: ' + validation.error);
                return;
            }
            
            // 执行操作（调用游戏引擎）
            console.log('执行引擎工具操作:', toolRequest);
            
            // 实际调用游戏引擎执行操作
            GameEngineInstance.processSingleRequest(toolRequest)
                .then(result => {
                    if (result.success) {
                        // 显示成功消息
                        alert('操作执行成功!');
                        
                        // 更新游戏数据显示
                        this.updateGameDataDisplay();
                        
                        // 重新加载游戏数据
                        loadDataJson();
                    } else {
                        alert('操作执行失败: ' + (result.error || '未知错误'));
                    }
                })
                .catch(error => {
                    console.error('执行引擎工具错误:', error);
                    alert('执行操作时出错: ' + error.message);
                });
        } catch (error) {
            console.error('执行引擎工具错误:', error);
            alert('执行操作时出错: ' + error.message);
        }
    }

    executeTime() {
        try {
            const timeInput = document.getElementById('time-input');
            if (!timeInput.value) {
                alert('请选择时间');
                return;
            }
            
            // 转换时间格式为 YYYY-MM-DD HH:mm:ss
            const date = new Date(timeInput.value);
            const formattedTime = date.toISOString().slice(0, 19).replace('T', ' ');
            
            // 执行操作
            this.executeTool('update', 'metadata.currentTime', formattedTime);
        } catch (error) {
            console.error('执行时间工具错误:', error);
            alert('执行操作时出错: ' + error.message);
        }
    }

    toggleEventForm() {
        const eventForm = document.getElementById('event-form');
        if (eventForm.style.display === 'none' || eventForm.style.display === '') {
            eventForm.style.display = 'block';
            
            // 设置默认时间为游戏当前时间
            try {
                const gameData = GameEngineInstance.getGameData();
                const currentTime = gameData.metadata?.currentTime;
                
                if (currentTime) {
                    // 转换游戏时间格式为 datetime-local 格式
                    const date = new Date(currentTime);
                    const formattedTime = date.toISOString().slice(0, 16); // 格式: YYYY-MM-DDTHH:mm
                    
                    // 设置开始时间和结束时间的默认值
                    const startTimeInput = document.getElementById('event-start-time');
                    const endTimeInput = document.getElementById('event-end-time');
                    
                    if (startTimeInput && !startTimeInput.value) {
                        startTimeInput.value = formattedTime;
                    }
                    
                    if (endTimeInput && !endTimeInput.value) {
                        // 结束时间默认设置为开始时间后1小时
                        const endDate = new Date(date);
                        endDate.setHours(date.getHours() + 1);
                        const formattedEndTime = endDate.toISOString().slice(0, 16);
                        endTimeInput.value = formattedEndTime;
                    }
                }
            } catch (error) {
                console.error('设置默认事件时间失败:', error);
            }
        } else {
            eventForm.style.display = 'none';
        }
    }

    executeEvent(action) {
        try {
            const eventName = document.getElementById('event-name').value;
            const eventDescription = document.getElementById('event-description').value;
            const eventStartTime = document.getElementById('event-start-time').value;
            const eventEndTime = document.getElementById('event-end-time').value;
            const eventImportance = document.getElementById('event-importance').value;
            
            if (!eventName || !eventDescription || !eventStartTime || !eventEndTime) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 转换时间格式
            const startDate = new Date(eventStartTime);
            const endDate = new Date(eventEndTime);
            const formattedStartTime = startDate.toISOString().slice(0, 19).replace('T', ' ');
            const formattedEndTime = endDate.toISOString().slice(0, 19).replace('T', ' ');
            
            // 创建事件数据对象
            const eventData = {
                name: eventName,
                description: eventDescription,
                startTime: formattedStartTime,
                expectedEndTime: formattedEndTime,
                importance: parseInt(eventImportance) || 3,
                status: 'foreground'
            };
            
            // 执行操作
            this.executeTool(action, null, eventData);
        } catch (error) {
            console.error('执行事件工具错误:', error);
            alert('执行操作时出错: ' + error.message);
        }
    }

    toggleForeshadowingForm() {
        const foreshadowingForm = document.getElementById('foreshadowing-form');
        if (foreshadowingForm.style.display === 'none' || foreshadowingForm.style.display === '') {
            foreshadowingForm.style.display = 'block';
            
            // 设置默认时间为游戏当前时间
            try {
                const gameData = GameEngineInstance.getGameData();
                const currentTime = gameData.metadata?.currentTime;
                
                if (currentTime) {
                    // 转换游戏时间格式为 datetime-local 格式
                    const date = new Date(currentTime);
                    const formattedTime = date.toISOString().slice(0, 16); // 格式: YYYY-MM-DDTHH:mm
                    
                    // 设置伏笔时间的默认值
                    const timeInput = document.getElementById('foreshadowing-time');
                    if (timeInput && !timeInput.value) {
                        timeInput.value = formattedTime;
                    }
                }
            } catch (error) {
                console.error('设置默认伏笔时间失败:', error);
            }
        } else {
            foreshadowingForm.style.display = 'none';
        }
    }

    executeForeshadowing(action) {
        try {
            const foreshadowingName = document.getElementById('foreshadowing-name').value;
            const foreshadowingDescription = document.getElementById('foreshadowing-description').value;
            const foreshadowingTime = document.getElementById('foreshadowing-time').value;
            const foreshadowingImportance = document.getElementById('foreshadowing-importance').value;
            
            if (!foreshadowingName || !foreshadowingDescription || !foreshadowingTime) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 转换时间格式
            const date = new Date(foreshadowingTime);
            const formattedTime = date.toISOString().slice(0, 19).replace('T', ' ');
            
            // 创建伏笔数据对象
            const foreshadowingData = {
                name: foreshadowingName,
                description: foreshadowingDescription,
                occurrenceTime: formattedTime,
                importance: parseInt(foreshadowingImportance) || 3
            };
            
            // 执行操作
            this.executeTool(action, null, foreshadowingData);
        } catch (error) {
            console.error('执行伏笔工具错误:', error);
            alert('执行操作时出错: ' + error.message);
        }
    }

    updateGameDataDisplay() {
        try {
            // 获取游戏数据
            const gameData = GameEngineInstance.getGameData();
            
            // 更新节拍数据
            if (gameData.narrative) {
                document.getElementById('current-beat').textContent = gameData.narrative.storyBeat || '未知';
                document.getElementById('current-beat-operation').textContent = gameData.narrative.storyBeatOperation || '未知';
            }
            
            // 更新景深数据
            if (gameData.narrative) {
                document.getElementById('current-depth-level').textContent = gameData.narrative.depthLevel || '未知';
            }
            
            // 更新时间数据
            if (gameData.metadata) {
                document.getElementById('current-time').textContent = gameData.metadata.currentTime || '未知';
            }
        } catch (error) {
            console.error('更新游戏数据显示错误:', error);
            // 如果获取游戏数据失败，保持显示"加载中..."
        }
    }

    // 更新压缩故事显示
    updateCompressedStoryDisplay() {
        try {
            // 获取压缩后的故事数据
            const compressedStory = StoryStorage.loadCompressedStory();
            
            // 更新显示
            const compressedStoryContent = document.getElementById('compressed-story-content');
            if (compressedStoryContent) {
                if (compressedStory && compressedStory.length > 0) {
                    // 格式化压缩故事为可读格式
                    let formattedStory = '';
                    compressedStory.forEach((msg, index) => {
                        formattedStory += `[${index + 1}] ${msg.role}: ${msg.content}\n\n`;
                    });
                    compressedStoryContent.textContent = formattedStory;
                } else {
                    compressedStoryContent.textContent = '无压缩故事数据';
                }
            }
        } catch (error) {
            console.error('更新压缩故事显示错误:', error);
            const compressedStoryContent = document.getElementById('compressed-story-content');
            if (compressedStoryContent) {
                compressedStoryContent.textContent = '加载压缩故事失败';
            }
        }
    }

    // 更新调试面板内容
    updateContent() {
        if (document.getElementById('lastAiResponse')) {
            if (debugData.lastAiResponse) {
                document.getElementById('lastAiResponse').textContent = debugData.lastAiResponse;
            } else {
                document.getElementById('lastAiResponse').textContent = '无数据';
            }
        }
        
        if (document.getElementById('lastApiRequest')) {
            if (debugData.lastApiRequest) {
                document.getElementById('lastApiRequest').textContent = debugData.lastApiRequest;
            } else {
                document.getElementById('lastApiRequest').textContent = '无数据';
            }
        }
        
        if (document.getElementById('dataJsonContent')) {
            if (debugData.dataJson) {
                document.getElementById('dataJsonContent').textContent = debugData.dataJson;
            } else {
                document.getElementById('dataJsonContent').textContent = '加载中...';
            }
        }
        
        // 更新压缩故事
        this.updateCompressedStoryDisplay();
    }
}

// 初始化调试面板
window.addEventListener('load', () => {
    if (typeof admin !== 'undefined' && admin) {
        window.DebugPanelInstance = new DebugPanel();
    }
});