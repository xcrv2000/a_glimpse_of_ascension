todos

在设置旁边加一个成就列表折叠框


成就相关的文字说明需要更改。共有三处：prompt.json内的描述，achievements.json内的描述，dataManager.js内的描述。

为了方便调试，ContextCompressor压缩临界值设为9。调试结束后应改为24。

用prompt分割数据部分内各个数据和故事部分
prompt需要调整顺序
删除管理员功能

当前模型上下文窗口128k，也就是说总prompt在50k以内就是安全的。



