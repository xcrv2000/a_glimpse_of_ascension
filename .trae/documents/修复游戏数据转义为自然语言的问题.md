1. **修改PromptManager.js**：在加载data.json时，从localStorage读取成就数据并整合到data对象中
2. **修改semanticInterpreter.js**：在游戏内时间后，事件列表前添加成就说明部分
3. **成就说明格式**：参考archived prompt文件中的成就系统叙事建议，包括：

   * 显示已完成的成就列表

   * 伟业类成就的特殊处理

   * 可见成就和隐藏成就的区分

   * 成就达成时的叙事建议
4. **数据整合逻辑**：

   * 优先从localStorage读取成就数据

   * 如果localStorage中没有数据，使用achievements.json默认数据

   * 将成就数据添加到data对象的achievements字段中
5. **测试验证**：确保成就数据能正确显示在语义中间层输出中

