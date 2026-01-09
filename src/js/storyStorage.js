// 故事存储管理模块
class StoryStorage {
    // 存储键名常量
    static get STORAGE_KEYS() {
        return {
            FULL_STORY: 'fullStory',
            COMPRESSED_STORY: 'compressedStory',
            UNCOMPRESSED_STORY: 'uncompressedStory',
            LATEST_USER_MESSAGE: 'latestUserMessage'
        };
    }
    
    // 保存完整故事（不做删减）
    static saveFullStory(story) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.FULL_STORY, JSON.stringify(story));
            console.log('完整故事已保存，长度:', story.length);
            return true;
        } catch (error) {
            console.error('保存完整故事失败:', error);
            return false;
        }
    }
    
    // 保存压缩故事
    static saveCompressedStory(compressedStory) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.COMPRESSED_STORY, JSON.stringify(compressedStory));
            console.log('压缩故事已保存，长度:', compressedStory.length);
            return true;
        } catch (error) {
            console.error('保存压缩故事失败:', error);
            return false;
        }
    }
    
    // 保存未压缩故事（实时故事）
    static saveUncompressedStory(uncompressedStory) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.UNCOMPRESSED_STORY, JSON.stringify(uncompressedStory));
            console.log('未压缩故事已保存，长度:', uncompressedStory.length);
            return true;
        } catch (error) {
            console.error('保存未压缩故事失败:', error);
            return false;
        }
    }
    
    // 保存最新用户消息
    static saveLatestUserMessage(message) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.LATEST_USER_MESSAGE, JSON.stringify(message));
            console.log('最新用户消息已保存');
            return true;
        } catch (error) {
            console.error('保存最新用户消息失败:', error);
            return false;
        }
    }
    
    // 加载完整故事
    static loadFullStory() {
        try {
            const storyStr = localStorage.getItem(this.STORAGE_KEYS.FULL_STORY);
            if (storyStr) {
                const story = JSON.parse(storyStr);
                console.log('成功加载完整故事，长度:', story.length);
                return story;
            }
            return [];
        } catch (error) {
            console.error('加载完整故事失败:', error);
            return [];
        }
    }
    
    // 加载压缩故事
    static loadCompressedStory() {
        try {
            const compressedStoryStr = localStorage.getItem(this.STORAGE_KEYS.COMPRESSED_STORY);
            if (compressedStoryStr) {
                const compressedStory = JSON.parse(compressedStoryStr);
                console.log('成功加载压缩故事，长度:', compressedStory.length);
                return compressedStory;
            }
            return [];
        } catch (error) {
            console.error('加载压缩故事失败:', error);
            return [];
        }
    }
    
    // 加载未压缩故事（实时故事）
    static loadUncompressedStory() {
        try {
            const uncompressedStoryStr = localStorage.getItem(this.STORAGE_KEYS.UNCOMPRESSED_STORY);
            if (uncompressedStoryStr) {
                const uncompressedStory = JSON.parse(uncompressedStoryStr);
                console.log('成功加载未压缩故事，长度:', uncompressedStory.length);
                return uncompressedStory;
            }
            return [];
        } catch (error) {
            console.error('加载未压缩故事失败:', error);
            return [];
        }
    }
    
    // 加载最新用户消息
    static loadLatestUserMessage() {
        try {
            const messageStr = localStorage.getItem(this.STORAGE_KEYS.LATEST_USER_MESSAGE);
            if (messageStr) {
                const message = JSON.parse(messageStr);
                console.log('成功加载最新用户消息');
                return message;
            }
            return null;
        } catch (error) {
            console.error('加载最新用户消息失败:', error);
            return null;
        }
    }
    
    // 清空所有存储的故事数据
    static clearAll() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('所有故事数据已清空');
            return true;
        } catch (error) {
            console.error('清空故事数据失败:', error);
            return false;
        }
    }
    
    // 保存所有故事数据
    static saveAll(fullStory, compressedStory, uncompressedStory, latestUserMessage) {
        const results = {
            fullStory: this.saveFullStory(fullStory),
            compressedStory: this.saveCompressedStory(compressedStory),
            uncompressedStory: this.saveUncompressedStory(uncompressedStory),
            latestUserMessage: this.saveLatestUserMessage(latestUserMessage)
        };
        console.log('所有故事数据保存结果:', results);
        return results;
    }
    
    // 加载所有故事数据
    static loadAll() {
        const data = {
            fullStory: this.loadFullStory(),
            compressedStory: this.loadCompressedStory(),
            uncompressedStory: this.loadUncompressedStory(),
            latestUserMessage: this.loadLatestUserMessage()
        };
        console.log('所有故事数据加载结果:', data);
        return data;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryStorage;
}