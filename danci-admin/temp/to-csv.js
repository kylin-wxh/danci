const fs = require("fs");
const path = require("path");

// 输入文件：默认处理同目录下的 PEPXiaoXue3_1.json，也可通过命令行参数指定
// 用法：node to-csv.js [输入.json] [输出.csv]
const inputFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "PEPXiaoXue3_1.json");

const outputFile = process.argv[3]
  ? path.resolve(process.argv[3])
  : inputFile.replace(/\.json$/i, ".csv");

// CSV 列（顺序）：wordRank、headWord、content、bookId
const COLUMNS = ["wordRank", "headWord", "content", "bookId"];

// CSV 字段转义：统一加双引号，内部双引号翻倍
function csvField(value) {
  const str = String(value);
  return '"' + str.replace(/"/g, '""') + '"';
}

function main() {
  const text = fs.readFileSync(inputFile, "utf-8");

  // 按行拆分（JSON Lines），忽略空行
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows = lines.map((line) => {
    const record = JSON.parse(line);
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