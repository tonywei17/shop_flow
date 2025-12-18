# 通知系统功能总结

## 📅 实装日期
2025年11月10日

## ✨ 功能概览

### 🏢 **B端管理系统 - 通知管理**

#### 1. 通知管理列表 (`/notifications`)
**功能特点：**
- 通知列表展示（表格形式）
- 统计数据卡片
  - 总送信数：248
  - 今月の送信：12
  - 平均開封率：68.4%
  - 総受信者数：1,846
- 多维度筛选
  - 送信先类型（全会员/プレミアム/無料/资格保持者/个别）
  - 状态（送信済み/下書き）
- 搜索功能
- 開封状況可视化（进度条）
- 快速操作（详细、送信）

**数据展示：**
- タイトル（标题和消息预览）
- 送信先（目标类型和人数）
- 送信日時
- 送信者
- 開封状況（已读/总数，百分比）
- ステータス（送信済み/下書き）

#### 2. 通知发送表单 (`/notifications/new`)
**功能特点：**
- **4种送信先类型**：
  1. **全会员**（1,234名）
  2. **会员レベル別**
     - 全ての会員（1,234名）
     - プレミアム会員のみ（456名）
     - 無料会員のみ（778名）
  3. **资格保持者**
     - 初級指導者資格（156名）
     - 中級指導者資格（58名）
     - 上級指導者資格（20名）
  4. **個別送信**（1名）
     - 会员搜索功能

- **通知内容设置**：
  - タイトル
  - メッセージ（最多500文字）
  - 文字数计数器

- **送信タイミング**：
  - 今すぐ送信
  - 送信予約（日期+时间）

- **实时预览**
- **受信者数显示**
- **送信先サマリー**

---

### 🎓 **C端学习平台 - 通知中心**

#### 1. 通知中心页面 (`/notifications`)
**功能特点：**
- 通知列表展示
- 未读通知高亮显示
  - 蓝色左边框
  - 蓝色圆点标识
- 通知类型标识
  - info（蓝色）
  - important（红色）
  - warning（黄色）
  - success（绿色）

**筛选功能：**
- すべて（显示所有通知）
- 未読（只显示未读）
- 显示通知数量

**交互功能：**
- ✅ 单个标记为已读
- ✅ 全部标记为已读
- 🗑️ 删除通知
- 实时更新未读数量

**通知信息：**
- 标题
- 消息内容
- 发送时间
- 已读/未读状态

#### 2. Header通知图标
**功能特点：**
- 🔔 通知铃铛图标
- 红色徽章显示未读数量
- 点击跳转到通知中心
- 仅登录用户可见

---

## 🎨 UI/UX 设计

### B端管理系统
**通知管理列表：**
- 表格式数据展示
- 统计卡片（蓝色图标）
- 开封率进度条可视化
- 状态标签（绿色=送信済み，灰色=下書き）

**通知发送表单：**
- 卡片式送信先选择（2x2网格）
- 蓝色高亮选中状态
- 实时预览（模拟通知卡片）
- 受信者数大字显示
- 帮助提示（蓝色背景）

### C端学习平台
**通知中心：**
- 清爽的白色卡片设计
- 未读通知蓝色左边框
- 彩色类型图标
- 悬浮操作按钮
- 空状态提示

**Header通知图标：**
- 红色徽章（未读数）
- 圆形背景悬浮效果
- 绝对定位徽章

---

## 📊 数据模型建议

### 通知表 (notifications)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'all', 'membership', 'qualification', 'individual'
  target_membership_type TEXT, -- 'all', 'premium', 'free'
  target_qualification_type TEXT, -- 'beginner', 'intermediate', 'advanced'
  target_member_id UUID REFERENCES members(id),
  send_immediately BOOLEAN DEFAULT true,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  sent_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft', -- 'draft', 'sent'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 通知接收表 (notification_recipients)
```sql
CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id),
  member_id UUID REFERENCES members(id),
  read_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 索引建议
```sql
-- 提高查询性能
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_notification_recipients_member ON notification_recipients(member_id);
CREATE INDEX idx_notification_recipients_read ON notification_recipients(member_id, read_at);
```

---

## 🔧 技术实现要点

### B端发送逻辑
```typescript
// 1. 根据target_type确定接收者
const getRecipients = async (notification) => {
  switch (notification.target_type) {
    case 'all':
      return await getAllMembers();
    case 'membership':
      return await getMembersByType(notification.target_membership_type);
    case 'qualification':
      return await getMembersByQualification(notification.target_qualification_type);
    case 'individual':
      return [await getMemberById(notification.target_member_id)];
  }
};

// 2. 批量创建接收记录
const sendNotification = async (notification) => {
  const recipients = await getRecipients(notification);
  
  await db.notification_recipients.insertMany(
    recipients.map(member => ({
      notification_id: notification.id,
      member_id: member.id,
      read_at: null,
    }))
  );
  
  // 3. 更新通知状态
  await db.notifications.update(notification.id, {
    status: 'sent',
    sent_at: new Date(),
  });
};
```

### C端查询优化
```typescript
// 获取用户通知（分页）
const getUserNotifications = async (memberId, page = 1, limit = 20) => {
  return await db.query(`
    SELECT 
      n.*,
      nr.read_at,
      nr.id as recipient_id
    FROM notifications n
    INNER JOIN notification_recipients nr ON n.id = nr.notification_id
    WHERE nr.member_id = $1
      AND nr.deleted_at IS NULL
    ORDER BY n.sent_at DESC
    LIMIT $2 OFFSET $3
  `, [memberId, limit, (page - 1) * limit]);
};

// 获取未读数量
const getUnreadCount = async (memberId) => {
  const result = await db.query(`
    SELECT COUNT(*) as count
    FROM notification_recipients
    WHERE member_id = $1
      AND read_at IS NULL
      AND deleted_at IS NULL
  `, [memberId]);
  
  return result.rows[0].count;
};
```

---

## 📱 实时通知（未来扩展）

### WebSocket实现
```typescript
// Server
io.on('connection', (socket) => {
  socket.on('join', (memberId) => {
    socket.join(`member_${memberId}`);
  });
});

// 发送通知时推送
const sendRealtimeNotification = (memberId, notification) => {
  io.to(`member_${memberId}`).emit('new_notification', notification);
};

// Client
socket.on('new_notification', (notification) => {
  // 更新UI
  updateNotificationBadge();
  showToast(notification.title);
});
```

### Push Notifications
```typescript
// 使用 Web Push API
const sendPushNotification = async (subscription, notification) => {
  await webpush.sendNotification(subscription, JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: '/icon.png',
    badge: '/badge.png',
  }));
};
```

---

## 🎯 发送场景示例

### 1. 全会员通知
```typescript
{
  title: "新コース公開のお知らせ",
  message: "リトミック上級指導者養成コースが公開されました。",
  target_type: "all",
  send_immediately: true
}
// → 1,234名に送信
```

### 2. プレミアム会員限定
```typescript
{
  title: "プレミアム会員限定イベント",
  message: "特別ワークショップのご案内です。",
  target_type: "membership",
  target_membership_type: "premium",
  send_immediately: true
}
// → 456名に送信
```

### 3. 资格保持者向け
```typescript
{
  title: "中級資格試験のご案内",
  message: "12月の試験申し込みを開始しました。",
  target_type: "qualification",
  target_qualification_type: "beginner",
  send_immediately: true
}
// → 156名に送信
```

### 4. 個別通知
```typescript
{
  title: "コース完了おめでとうございます",
  message: "修了証明書をダウンロードできます。",
  target_type: "individual",
  target_member_id: "user_123",
  send_immediately: true
}
// → 1名に送信
```

---

## 📈 分析指標

### 管理端可追踪
- 送信数
- 開封率
- 開封までの平均時間
- 削除率
- 送信先別の効果

### 実装建议
```sql
-- 開封率レポート
SELECT 
  n.id,
  n.title,
  COUNT(nr.id) as total_recipients,
  COUNT(nr.read_at) as read_count,
  ROUND(COUNT(nr.read_at)::numeric / COUNT(nr.id) * 100, 2) as open_rate
FROM notifications n
LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
WHERE n.status = 'sent'
GROUP BY n.id, n.title
ORDER BY n.sent_at DESC;
```

---

## ✅ 测试确认

所有页面已在以下环境测试通过：
- ✅ B端通知管理列表 (http://localhost:3000/notifications)
- ✅ B端通知发送表单 (http://localhost:3000/notifications/new)
- ✅ C端通知中心 (http://localhost:3002/notifications)
- ✅ C端Header通知图标（带未读徽章）

---

## 🚀 下一步开发建议

### 优先级高
1. 连接Supabase数据库
2. 实装API路由
3. 实际发送逻辑
4. 已读/未读状态同步

### 优先级中
1. 邮件通知集成
2. 通知模板系统
3. 定时发送功能
4. 通知历史归档

### 优先级低
1. WebSocket实时推送
2. Push Notifications
3. 通知偏好设置
4. 通知分类/标签

---

## 💡 使用建议

### 管理员
1. 选择合适的送信先类型
2. 编写简洁明了的标题
3. 重要信息放在消息开头
4. 使用预约发送避开非工作时间
5. 定期检查開封率优化内容

### 开发者
1. 实装批量发送优化性能
2. 添加发送队列避免阻塞
3. 实装重试机制
4. 监控发送失败情况
5. 定期清理旧通知数据

---

## 📞 技术支持

如有问题或需要进一步开发，请联系开发团队。
