// Prints one edit ticket for inspection. The caller decides when to submit it.
import process from 'node:process';

function revisionNumber(input) {
  const value = Number(input);
  if (!/^\d+$/.test(input ?? '') || !Number.isSafeInteger(value)) {
    throw new Error('工程编号必须是非负整数。');
  }
  return value;
}

function makeTicket(args) {
  if (args[0] === 'undo' && args.length === 2) {
    return { revision: revisionNumber(args[1]), ops: [{ op: 'undo' }] };
  }
  if (args.length !== 4) {
    throw new Error('用法：make-ticket.mjs 工程编号 镜头编号 "字幕" 音量，或 make-ticket.mjs undo 工程编号');
  }
  const [revision, clipId, caption, gain] = args;
  const clip = clipId.trim();
  const value = Number(gain);
  if (!clip || !caption.trim()) throw new Error('请填写镜头编号和字幕。');
  if (!gain.trim() || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error('这个示例接受 0 到 1 的音量，1 表示原声大小。');
  }
  return {
    revision: revisionNumber(revision),
    ops: [
      { op: 'caption', clip, text: caption },
      { op: 'volume', clip, value }
    ]
  };
}

try {
  console.log(JSON.stringify(makeTicket(process.argv.slice(2)), null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
