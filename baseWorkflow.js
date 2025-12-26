/**
 * 工作流基类 - 通用流程控制能力
 */
class BaseWorkflow {
  constructor() {
    this.nodes = []; // 工作流节点列表
    this.context = {}; // 工作流上下文（存储节点间共享数据）
    this.status = 'idle'; // 流程状态：idle/running/success/failed/canceled
    this.retryCount = 0; // 重试次数
    this.maxRetry = 2; // 最大重试次数
    // 新增：事件监听容器
    this.events = {};
  }

  // 添加工作流节点
  addNode(node) {
    if (typeof node.execute !== 'function') throw new Error('节点必须实现execute方法');
    this.nodes.push(node);
    return this; // 链式调用
  }

  // 新增：事件监听方法
  on(eventName, handler) {
    if (typeof handler !== 'function') return;
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(handler);
  }

  // 新增：事件触发方法
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error(`触发${eventName}事件失败:`, e);
      }
    });
  }

  // 执行工作流
  async run(initialContext = {}) {
    if (this.status === 'running') return;
    this.status = 'running';
    this.context = { ...initialContext }; // 初始化上下文
    // 新增：触发工作流开始事件
    this.emit('start', this.context);

    try {
      // 依次执行所有节点
      for (const node of this.nodes) {
        // 跳过标记为skip的节点
        if (node.skip) continue;
        // 新增：触发节点开始事件
        this.emit('nodeStart', { nodeName: node.name, context: this.context });
        
        // 执行节点，将结果合并到上下文
        const nodeResult = await node.execute(this.context);
        this.context = { ...this.context, ...nodeResult };
        
        // 新增：触发节点完成事件
        this.emit('nodeEnd', { nodeName: node.name, context: this.context });
      }
      this.status = 'success';
      // 新增：触发工作流完成事件
      this.emit('complete', { status: this.status, context: this.context });
      return this.context;
    } catch (error) {
      this.status = 'failed';
      console.error(`工作流执行失败: ${error.message}`);
      // 新增：触发错误事件
      this.emit('error', error);
      
      // 失败重试逻辑
      if (this.retryCount < this.maxRetry) {
        this.retryCount++;
        // 新增：触发重试事件
        this.emit('retry', { count: this.retryCount, error });
        console.log(`重试第${this.retryCount}次...`);
        return this.run(initialContext);
      }
      throw error; // 重试耗尽，抛出错误
    } finally {
      // 执行后置清理
      this.cleanup();
    }
  }

  // 终止工作流
  cancel() {
    this.status = 'canceled';
    this.cleanup();
  }

  // 后置清理（子类可重写）
  cleanup() {
    this.retryCount = 0;
    // 可扩展：清理临时DOM、重置状态等
  }
}

// 工作流节点基类
class WorkflowNode {
  constructor(name, skip = false) {
    this.name = name; // 节点名称
    this.skip = skip; // 是否跳过该节点
  }

  // 节点执行逻辑（子类必须实现）
  async execute(context) {
    throw new Error('子类必须实现execute方法');
  }
}

// 挂载到全局
window.BaseWorkflow = BaseWorkflow;
window.WorkflowNode = WorkflowNode;