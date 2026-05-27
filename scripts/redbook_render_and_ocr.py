#!/usr/bin/env python3
"""
红宝书方案 B：从 PDF 导出指定页为 PNG，再用 macOS Vision（ocrmac）做 OCR。

用法示例（PDF 第 514 页，对应 load_page(513)）：
  python3 scripts/redbook_render_and_ocr.py \\
    --pdf "资源汇总/红宝书大全集 新日本语能力考试N1-N5文字词汇详解_ (z-library.sk, 1lib.sk, z-lib.sk).pdf" \\
    --page 514 --dpi 200

依赖：pip3 install -r scripts/requirements-redbook-ocr.txt
系统：macOS（ocrmac 使用 Vision 框架）

输出（默认在项目 data/redbook-ocr/ 下）：
  pages/p{page}_dpi{dpi}.png
  text/p{page}_dpi{dpi}.txt 按阅读顺序拼接的纯文本
  text/p{page}_dpi{dpi}.json      原始标注 + 排序后行
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

import fitz
from ocrmac import ocrmac


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def sort_annotations_reading_order(
    annotations: list[tuple[str, float, list[float]]],
) -> list[tuple[str, float, list[float]]]:
    """按版面阅读顺序排序：自上而下，同行从左到右。

    ocrmac 返回的 box 为 [x, y, width, height]（归一化，原点在左上）。
    """
    return sorted(annotations, key=lambda a: (-a[2][1], a[2][0]))


def cluster_into_lines(
    sorted_ann: list[tuple[str, float, list[float]]],
    y_tolerance: float = 0.012,
) -> list[str]:
    """将排序后的片段按行聚类，行内用空格连接。"""
    if not sorted_ann:
        return []

    lines: dict[int, list[tuple[float, str]]] = defaultdict(list)
    row_id = 0
    current_y: float | None = None

    for text, _conf, box in sorted_ann:
        x, y, _w, _h = box
        if current_y is None or abs(y - current_y) > y_tolerance:
            row_id += 1
            current_y = y
        lines[row_id].append((x, text.strip()))

    out: list[str] = []
    for rid in sorted(lines.keys()):
        parts = [t for _x, t in sorted(lines[rid], key=lambda p: p[0])]
        line = " ".join(p for p in parts if p)
        if line:
            out.append(line)
    return out


def main() -> None:
    root = repo_root()
    default_pdf = (
        root
        / "资源汇总"
        / "红宝书大全集 新日本语能力考试N1-N5文字词汇详解_ (z-library.sk, 1lib.sk, z-lib.sk).pdf"
    )

    ap = argparse.ArgumentParser(description="红宝书 PDF 单页渲染 + OCR（macOS Vision）")
    ap.add_argument("--pdf", type=Path, default=default_pdf, help="PDF 路径")
    ap.add_argument("--page", type=int, required=True, help="PDF 页码（从 1 开始）")
    ap.add_argument("--dpi", type=int, default=200, help="渲染 DPI，默认 200")
    ap.add_argument(
        "--out-dir",
        type=Path,
        default=root / "data" / "redbook-ocr",
        help="输出根目录（下含 pages/、text/）",
    )
    ap.add_argument(
        "--lang",
        nargs="*",
        default=["ja-JP", "zh-Hans", "en-US"],
        help="Vision 语言偏好，默认 ja zh en",
    )
    args = ap.parse_args()

    pdf_path = args.pdf
    if not pdf_path.is_absolute():
        pdf_path = (root / pdf_path).resolve()
    if not pdf_path.exists():
        raise SystemExit(f"找不到 PDF：{pdf_path}")

    page_index = args.page - 1
    doc = fitz.open(pdf_path)
    if page_index < 0 or page_index >= doc.page_count:
        raise SystemExit(
            f"页码 {args.page} 无效（文档共 {doc.page_count} 页，有效范围 1–{doc.page_count}）",
        )

    pages_dir = args.out_dir / "pages"
    text_dir = args.out_dir / "text"
    pages_dir.mkdir(parents=True, exist_ok=True)
    text_dir.mkdir(parents=True, exist_ok=True)

    stem = f"p{args.page}_dpi{args.dpi}"
    png_path = pages_dir / f"{stem}.png"

    page = doc.load_page(page_index)
    mat = fitz.Matrix(args.dpi / 72, args.dpi / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    pix.save(str(png_path))

    annotations = ocrmac.OCR(
        str(png_path),
        language_preference=args.lang,
        recognition_level="accurate",
    ).recognize()

    ordered = sort_annotations_reading_order(list(annotations))
    lines = cluster_into_lines(ordered)
    plain = "\n".join(lines)

    txt_path = text_dir / f"{stem}.txt"
    json_path = text_dir / f"{stem}.json"
    txt_path.write_text(plain, encoding="utf-8")
    json_path.write_text(
        json.dumps(
            {
                "source_pdf": str(pdf_path.relative_to(root)) if pdf_path.is_relative_to(root) else str(pdf_path),
                "page_1based": args.page,
                "dpi": args.dpi,
                "png": str(png_path.relative_to(root)) if png_path.is_relative_to(root) else str(png_path),
                "language_preference": args.lang,
                "lines": lines,
                "annotations_ordered": [
                    {"text": t, "confidence": c, "box": b} for t, c, b in ordered
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"PNG  -> {png_path}")
    print(f"TXT  -> {txt_path}")
    print(f"JSON -> {json_path}")
    print(f"行数: {len(lines)} | 片段数: {len(ordered)}")


if __name__ == "__main__":
    main()
