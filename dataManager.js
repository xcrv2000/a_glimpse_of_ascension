// 数据管理模块
class DataManager {
    // 读取data.json文件
    static async readData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`读取data.json失败: ${response.status}`);
            }
            const data = await response.json();
            console.log('成功读取data.json:', data);
            return data;
        } catch (error) {
            console.error('读取data.json错误:', error);
            // 如果文件不存在或解析失败，返回空对象
            return {};
        }
    }

    // 写入数据到data.json文件
    static async writeData(data) {
        try {
            // 注意：在浏览器环境中，我们无法直接写入本地文件
            // 这里我们将数据存储在localStorage中作为临时解决方案
            // 实际生产环境中可能需要后端API支持
            localStorage.setItem('gameData', JSON.stringify(data, null, 2));
            console.log('成功写入数据到localStorage:', data);
            return true;
        } catch (error) {
            console.error('写入数据错误:', error);
            return false;
        }
    }

    // 合并数据更新
    static mergeData(currentData, updateData) {
        try {
            // 递归合并对象
            const mergedData = { ...currentData };
            
            for (const key in updateData) {
                if (updateData.hasOwnProperty(key)) {
                    if (typeof updateData[key] === 'object' && updateData[key] !== null) {
                        // 如果是嵌套对象，递归合并
                        mergedData[key] = this.mergeData(mergedData[key] || {}, updateData[key]);
                    } else {
                        // 直接替换值
                        mergedData[key] = updateData[key];
                    }
                }
            }
            
            console.log('数据合并成功:', mergedData);
            return mergedData;
        } catch (error) {
            console.error('数据合并错误:', error);
            return currentData;
        }
    }

    // 更新指定路径的数据
    static updateDataByPath(currentData, path, value) {
        try {
            const keys = path.split('.');
            const updatedData = { ...currentData };
            let current = updatedData;
            
            // 遍历路径，创建不存在的对象
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key] || typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            }
            
            // 设置最终值
            current[keys[keys.length - 1]] = value;
            console.log(`成功更新路径 ${path} 的数据:`, value);
            return updatedData;
        } catch (error) {
            console.error('路径更新错误:', error);
            return currentData;
        }
    }

    // 删除指定路径的数据
    static deleteDataByPath(currentData, path) {
        try {
            const keys = path.split('.');
            const updatedData = { ...currentData };
            let current = updatedData;
            
            // 遍历到倒数第二个键
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    // 路径不存在，直接返回
                    return updatedData;
                }
                current = current[key];
            }
            
            // 删除最后一个键
            const lastKey = keys[keys.length - 1];
            delete current[lastKey];
            console.log(`成功删除路径 ${path} 的数据`);
            return updatedData;
        } catch (error) {
            console.error('路径删除错误:', error);
            return currentData;
        }
    }

    // 初始化默认数据
    static getDefaultData() {
        return {
            narrative: {
                depthLevel: "1",
                storyBeat: "起"
            },
            metadata: {
                lastUpdated: new Date().toISOString(),
                version: "1.0.0"
            }
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
