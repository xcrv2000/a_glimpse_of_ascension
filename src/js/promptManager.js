// 提示词管理模块
class PromptManager {
    // 获取当前提示词模式
    static getCurrentMode() {
        try {
            const settings = localStorage.getItem('gameSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                const mode = parsedSettings.promptMode;
                // 只有当明确设置为'simplified'时才使用简略模式，否则默认使用两阶段模式
                return mode === 'simplified' ? 'simplified' : 'twoPhase';
            }
            return 'twoPhase';
        } catch (error) {
            console.error('获取提示词模式失败:', error);
            return 'twoPhase';
        }
    }

    // 设置提示词模式
    static setMode(mode) {
        try {
            const settings = localStorage.getItem('gameSettings');
            let parsedSettings = {};
            if (settings) {
                parsedSettings = JSON.parse(settings);
            }
            parsedSettings.promptMode = mode;
            localStorage.setItem('gameSettings', JSON.stringify(parsedSettings));
            console.log('提示词模式已设置为:', mode);
        } catch (error) {
            console.error('设置提示词模式失败:', error);
        }
    }

    // 加载提示词文件
    static async loadPrompts(mode = null) {
        const currentMode = mode || this.getCurrentMode();
        let systemPrompt = '';
        
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            let promptPath = '';
            
            if (currentMode === 'simplified') {
                promptPath = `${basePath}/data/promptSimplified.json`;
            } else {
                promptPath = `${basePath}/data/prompt_storyteller.json`;
            }
            
            const response = await fetch(promptPath);
            if (response.ok) {
                systemPrompt = await response.text();
                console.log(`成功加载${currentMode}模式提示词`);
            }
        } catch (error) {
            console.error('加载提示词失败:', error);
            systemPrompt = "你是一个故事生成助手。你要告诉用户：系统提示词导入失败。自由探索吧！";
        }
        
        // 加载lore.json
        let loreContent = "";
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const lorePath = `${basePath}/data/lore.json`;
            const loreResponse = await fetch(lorePath);
            if (loreResponse.ok) {
                loreContent = await loreResponse.text();
                console.log('成功获取lore.json（纯文本格式）');
            }
        } catch (error) {
            console.error('获取lore.json失败:', error);
        }
        
        // 加载data.json
        let dataContent = "";
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const dataPath = `${basePath}/data/data.json`;
            const dataResponse = await fetch(dataPath);
            if (dataResponse.ok) {
                dataContent = await dataResponse.text();
                console.log('成功获取data.json（纯文本格式）');
            }
        } catch (error) {
            console.error('获取data.json失败:', error);
        }
        
        return {
            systemPrompt,
            loreContent,
            dataContent
        };
    }

    // 加载故事记录者提示词
    static async loadRecorderPrompt() {
        try {
            const basePath = window.location.pathname.includes('src') ? '' : 'src';
            const promptPath = `${basePath}/data/prompt_recorder.json`;
            
            const response = await fetch(promptPath);
            if (response.ok) {
                const prompt = await response.text();
                console.log('成功加载故事记录者提示词');
                return prompt;
            }
            console.error('加载故事记录者提示词失败');
            return "";
        } catch (error) {
            console.error('加载故事记录者提示词失败:', error);
            return "";
        }
    }

    // 检查是否为简略模式
    static isSimplifiedMode() {
        return this.getCurrentMode() === 'simplified';
    }

    // 切换到两阶段模式
    static switchToTwoPhaseMode() {
        this.setMode('twoPhase');
    }

    // 切换到简略模式
    static switchToSimplifiedMode() {
        this.setMode('simplified');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptManager;
}