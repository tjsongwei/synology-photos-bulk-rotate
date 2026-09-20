# Synology Photos Bulk Rotate

[English](./README.md) | [日本語](./README.ja.md) | **简体中文**

这是一个 Tampermonkey 用户脚本，为 Synology Photos 网页版增加键盘快捷键和**多张照片批量旋转**功能。

Synology Photos 的照片列表目前没有方便的批量旋转操作。使用本脚本，可以选中多张照片后一次旋转，并且无需重新加载整个页面。

## 功能

| 按键 | 照片列表 | 单张照片查看器 |
| --- | --- | --- |
| `R` | 将所有选中的照片向右旋转90° | 当前照片向右旋转90° |
| `L` | 将所有选中的照片向左旋转90° | 当前照片向左旋转90° |
| `→` | — | 下一张照片 |
| `←` | — | 上一张照片 |

批量旋转使用在浏览器中的 Synology Photos 界面实际观察到的 Web API：

- `SYNO.FotoTeam.Browse.Item`
- `method=set`
- `rotate_action="clockwise"` 或 `"counter_clockwise"`

批量旋转后，脚本只刷新受影响照片的缩略图，**不会重新加载整个 Synology Photos 页面**，因此可以保留筛选条件和当前滚动位置。

## 已测试环境

初始版本已在以下环境测试：

- Synology DSM 7.4.1-90080
- Synology Photos 网页版
- Google Chrome
- Tampermonkey

其他 DSM / Synology Photos / 浏览器版本也可能可以使用，但目前尚未验证。

## 安装

### 1. 安装 Tampermonkey

从 Tampermonkey 官方网站或浏览器扩展商店安装 Tampermonkey。

### 2. 允许用户脚本运行

较新的 Chrome/Tampermonkey 版本可能需要额外允许用户脚本运行。

打开：

`Chrome → 扩展程序 → 管理扩展程序 → Tampermonkey → 详细信息`

然后启用**“允许用户脚本”**。具体名称可能会因 Chrome/Tampermonkey 版本不同而略有差异。

如果已经安装脚本，但 Tampermonkey 显示脚本“尚未运行”，请首先检查此设置。

### 3. 安装本脚本

打开：

[`synology-photos-bulk-rotate.user.js`](./synology-photos-bulk-rotate.user.js)

然后点击 **Raw**。Tampermonkey 应会显示用户脚本安装页面。

> 由于 Synology Photos 可能通过不同的域名、IP 地址以及 HTTPS 端口访问，本脚本使用 `@match https://*/*`。脚本在处理键盘输入之前会先判断当前页面是否为 Synology Photos。脚本使用 `@grant none`，不会向外部服务发送数据。
>
> 如果希望限制脚本权限，可以在安装后将 `@match` 修改为自己的 Synology Photos 地址，例如：
>
> ```javascript
> // @match https://nas.example.com:5001/*
> ```

## 使用方法

### 批量旋转照片

1. 在浏览器中打开 Synology Photos。
2. 在时间线/列表中选中需要旋转的多张照片。
3. 按 `R` 向右旋转90°，或按 `L` 向左旋转90°。
4. 在确认对话框中确认执行。
5. 所选照片将一起旋转，只刷新这些照片的缩略图。

页面本身不会重新加载。

### 单张照片查看器

打开单张照片时：

- `L`：向左旋转90°
- `R`：向右旋转90°
- `←` / `→`：切换上一张/下一张照片

Synology Photos 查看器提供的是向左旋转操作，因此脚本在单张照片查看器中通过连续执行三次左旋转来实现右旋转。

## 为什么不重新加载整个页面？

重新加载 Synology Photos 可能比较慢，而且可能丢失筛选条件等临时界面状态，或者失去当前在大量照片时间线中的位置。

因此，本脚本只重新获取已旋转照片对应的缩略图 `<img>`。

## 已知限制

- 横向照片旋转为纵向（或相反）后，Synology Photos 当前行布局不会立即重新计算，因此刚刷新的缩略图可能暂时出现部分被裁切的现象。
- 这只是当前列表界面的显示问题。重新加载 Synology Photos 后，缩略图布局会恢复正常。
- 本脚本依赖 Synology Photos 的内部 Web API 和 DOM 结构。未来 DSM 或 Synology Photos 更新后，这些接口可能发生变化，届时脚本可能需要更新。
- 除上述测试环境外，其他版本暂不保证兼容。

## 安全与隐私

本脚本：

- 通过 Tampermonkey 在浏览器本地运行。
- 使用当前已登录的 Synology Photos 会话。
- 不在代码中保存 Synology 用户名、密码、会话令牌或 NAS 地址。
- 不会将照片信息发送到外部服务器。

提交 Issue 时，请不要公开 Cookie、`SynoToken` 或其他会话认证信息。

## 故障排除

**按 R / L 没有反应**

请确认：

1. Tampermonkey 已启用。
2. 本用户脚本已启用。
3. Chrome 已允许 Tampermonkey 运行用户脚本。
4. 安装或启用脚本后，已重新加载 Synology Photos 标签页。

**照片已经旋转，但缩略图看起来被裁切**

这是已知的临时显示限制。实际旋转已经完成。重新加载 Synology Photos 后即可恢复正常的缩略图布局。

**旋转失败**

按 `F12` 打开 Chrome DevTools，进入 **Console**，检查以以下文字开头的信息：

```text
[Synology Photos Bulk Rotate]
```

提交 Issue 时，请从日志或截图中删除 Cookie、SynoToken、主机名以及其他隐私信息。

## 免责声明

本项目是独立开发的用户脚本，**与 Synology Inc. 或 Tampermonkey 没有隶属、合作或官方认可关系**。

脚本使用 Synology Photos Web 应用的内部行为，这些行为可能随时发生变化。请为重要照片做好备份，并在大批量使用之前先用少量非重要照片进行测试。

## 许可证

MIT License。详见 [LICENSE](./LICENSE)。

## Contributing

欢迎通过 GitHub Issues 提交错误报告和兼容性信息。报告问题时，建议提供 DSM、Synology Photos、浏览器和 Tampermonkey 的版本，但请**不要**提供认证令牌或私有 NAS URL。
