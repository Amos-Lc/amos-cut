# 给一个镜头加字幕、调音量

在 AMOS 剪辑台打开一个已有工程，选择一段带原声的视频。下面的例子会把它的字幕改为「出发」，把原声音量调为原来的 80%。运行示例程序需要 Node.js。

## 1. 找到镜头

通过客户端提供的 MCP 工具调用 `get_project`，参数用 `{"view":"summary"}`。记下返回的 `revision`，它是工程当前的修改编号。再调用 `get_project` 读取时间线的一页。下面用 12 举例，请换成刚读到的编号。

```json
{"view":"timeline","revision":12,"offset":0,"limit":20}
```

在 `items` 里找 `track` 为 `main`、`clip.gap` 不为真的目标镜头。用起止帧确认位置，记下 `clip.id`。如果还有下一页，用返回的 `nextOffset` 作为新的 `offset`。

## 2. 生成并查看工单

在仓库目录运行下面的命令。把 12 和 clip-id 换成刚读到的值。

```shell
node examples/make-ticket.mjs 12 clip-id "出发" 0.8
```

示例只打印 JSON。检查 `clip` 和字幕后，将整份 JSON 作为一次 `edit_timeline` 调用的参数。两条操作要么一起生效，要么都不写入。

```json
{
  "revision": 12,
  "ops": [
    {"op":"caption","clip":"clip-id","text":"出发"},
    {"op":"volume","clip":"clip-id","value":0.8}
  ]
}
```

也可以用客户端提供的 `amosctl.cmd`。在 PowerShell 中，把工单存为 UTF-8 文件，然后提交一次。下面的命令假设 `amosctl.cmd` 在命令搜索路径中。

```powershell
node examples/make-ticket.mjs 12 clip-id "出发" 0.8 | Set-Content -Encoding utf8 ticket.json
amosctl.cmd batch --file ticket.json
```

## 3. 核对与撤销

成功回执中，`result.status` 为 `applied`，`result.operations` 为 2，`changes.updated` 列出有变化的镜头编号，`revision` 是新的修改编号。在时间线播放这一段，核对字幕和原声。

要撤销刚提交的一整张工单，在其他人继续编辑之前，把回执的编号传给示例。例如 `node examples/make-ticket.mjs undo 13`。检查输出，再通过 `edit_timeline` 提交。若提示工程已有新修改，先重新读取、核对时间线，再决定下一步。
