import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 默认输入文件：scripts 目录上一级 temp 目录下的 PEPXiaoXue3_1.json
// 用法：node scripts/json2csv.mjs [输入.json] [输出.csv]
const inputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../temp/PEPXiaoXue6_1.json");

// 输出到与输入相同的目录
const outputFile = process.argv[3]
  ? path.resolve(process.argv[3])
  : inputFile.replace(/\.json$/i, ".csv");

// CSV 列（顺序）
const COLUMNS = ["wordRank", "headWord", "content", "bookId"];

// 切分文件中连续排列的多个 JSON 对象（如 `{...}\n{...}\n{...}`，无逗号、无数组包裹）
function splitJsonObjects(text) {
  const objects = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let current = "";

  for (const ch of text) {
    current += ch;

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        objects.push(current.trim());
        current = "";
      }
    }
  }

  return objects;
}

// CSV 字段转义：统一加双引号，内部双引号翻倍
function csvField(value) {
  const str = String(value);
  return '"' + str.replace(/"/g, '""') + '"';
}

function main() {
  const text = fs.readFileSync(inputFile, "utf-8");
  const objects = splitJsonObjects(text);

  const rows = objects.map((raw) => {
    const record = JSON.parse(raw);
    return COLUMNS.map((col) => {
      if (col === "content") {
        // content 作为 JSON 字符串保存
        return csvField(JSON.stringify(record[col] ?? null));
      }
      return csvField(record[col] ?? "");
    }).join(",");
  });

  const header = COLUMNS.join(",");
  const csv = [header, ...rows].join("\r\n") + "\r\n";

  fs.writeFileSync(outputFile, csv, "utf-8");
  console.log(`已生成 ${outputFile}，共 ${rows.length} 条记录`);
}

main();