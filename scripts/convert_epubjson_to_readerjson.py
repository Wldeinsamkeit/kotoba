import argparse
import json
import os
import re
from typing import Any, Dict, List, Optional


CHAPTER_ID_SAFE = re.compile(r"[^a-zA-Z0-9_-]+")


def to_safe_id(s: str) -> str:
  s = s.strip()
  s = CHAPTER_ID_SAFE.sub("-", s)
  s = re.sub(r"-+", "-", s)
  return s.strip("-") or "book"


def extract_paragraph_texts(node: Any, out: List[str]) -> None:
  """
  Extract all node.type == "paragraph" texts from the epub->json structure.
  The input format looks like: {type, text, content:[...]} and has containers.
  """
  if node is None:
    return

  if isinstance(node, list):
    for it in node:
      extract_paragraph_texts(it, out)
    return

  if not isinstance(node, dict):
    return

  t = node.get("type")
  if t == "paragraph":
    text = node.get("text")
    if isinstance(text, str):
      text = text.strip()
      if text:
        out.append(text)
    # Even if it's a paragraph, it may still contain inner content; ignore for simplicity.
    return

  # Common container key in exported formats
  if "content" in node:
    extract_paragraph_texts(node["content"], out)
    return

  # Fallback: scan all values (slower but robust for unknown shapes)
  for v in node.values():
    if isinstance(v, (dict, list)):
      extract_paragraph_texts(v, out)


def split_paragraphs(paragraphs: List[str], min_len: int = 2) -> List[str]:
  # 1) 基础清理：压缩空白、去掉空串
  cleaned: List[str] = []
  for p in paragraphs:
    p2 = re.sub(r"\s+", " ", p).strip()
    if len(p2) >= min_len:
      cleaned.append(p2)
  return cleaned


def is_noise_paragraph(p: str) -> bool:
  """
  针对 epub->json 的导出噪音做保守过滤（避免误删正文）。
  主要过滤：版式/电子书说明、版权页、目录页等。
  """
  s = p.strip()
  if not s:
    return True

  # 数字/标记类噪音（页面号、分隔符等）
  if re.fullmatch(r"[0-9０-９一二三四五六七八九十百千万]+", s):
    return True
  if re.fullmatch(r"[-‐‑–—…・\s]+", s):
    return True

  noise_markers = [
    # 版式说明/排版提示（你这份 epub 里开头能看到类似句子）
    "この本は縦書きでレイアウトされています。",
    "ご覧になる機種により、表示の差が認められることがあります。",
    "本作品を電子書籍版に収録するにあたり",
    "一部の漢字が簡略体で表記されている場合があります。",
    # 常见版权/发行提示（不同来源可能出现）
    "著作権",
    "無断",
    "転載",
    "禁無断",
    "発行",
    "奥付",
    "はじめに",
    "あとがき",
  ]

  for marker in noise_markers:
    if marker in s:
      return True

  return False


def split_into_nice_paragraphs(
  paragraphs: List[str],
  max_chars: int = 220,
  min_chars: int = 12,
) -> List[str]:
  """
  将过长段落按日文句号/问号/感叹号拆分到更合适的粒度。
  """

  def sentence_chunks(text: str) -> List[str]:
    # 保留标点：每个句子尽量以 。！？ 结尾
    chunks: List[str] = []
    buf = ""
    for ch in text:
      buf += ch
      if ch in "。！？":
        chunks.append(buf.strip())
        buf = ""
    if buf.strip():
      chunks.append(buf.strip())
    return chunks

  out: List[str] = []
  for p in paragraphs:
    p = p.strip()
    if not p:
      continue

    if len(p) <= max_chars:
      # 过短段落仍可能是正文（例如对话“勇気？”），这里不强制过滤
      if len(p) >= min_chars or not out:
        out.append(p)
      else:
        out.append(p)
      continue

    # 过长：按句子拆分，再聚合到 max_chars 附近
    chunks = sentence_chunks(p)
    cur = ""
    for c in chunks:
      if not c:
        continue
      if not cur:
        cur = c
        continue
      # 决定是否把下一个句子拼进去
      if len(cur) + 1 + len(c) <= max_chars:
        cur += c
      else:
        out.append(cur)
        cur = c
    if cur:
      out.append(cur)
  return [x for x in out if x and len(x) >= 1]


def convert(input_path: str, output_path: str, book_id: str, book_title: str) -> None:
  with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

  metadata = data.get("metadata") if isinstance(data, dict) else None
  if isinstance(metadata, dict):
    title_from_meta = metadata.get("title")
    if isinstance(title_from_meta, str) and book_title == "":
      book_title = title_from_meta

  chapters_in = data.get("chapters", []) if isinstance(data, dict) else []
  if not isinstance(chapters_in, list):
    raise ValueError("Input JSON: chapters is not an array.")

  chapters_out: List[Dict[str, Any]] = []

  for idx, ch in enumerate(chapters_in, start=1):
    if not isinstance(ch, dict):
      continue

    chapter_number = ch.get("chapter_number")
    chapter_title = ch.get("title")
    if not isinstance(chapter_title, str) or not chapter_title.strip():
      chapter_title = f"第{chapter_number}章" if chapter_number is not None else f"章 {idx}"

    # The epub-json format stores paragraphs under ch.content (nested)
    content = ch.get("content")
    paragraphs: List[str] = []
    extract_paragraph_texts(content, paragraphs)
    paragraphs = split_paragraphs(paragraphs, min_len=2)
    # 2) 噪音过滤（版式/版权说明）
    paragraphs = [p for p in paragraphs if not is_noise_paragraph(p)]
    # 3) 重新切分更友好的段落粒度
    paragraphs = split_into_nice_paragraphs(paragraphs, max_chars=220, min_chars=10)

    if not paragraphs:
      # Skip empty chapters
      continue

    # Use stable ids: ch{chapter_number} if possible
    if chapter_number is not None and isinstance(chapter_number, (int, float)):
      ch_id = f"ch{int(chapter_number)}"
    else:
      ch_id = f"ch{idx}"

    chapters_out.append(
      {
        "id": ch_id,
        "title": chapter_title.strip()[:80],
        "paragraphs": paragraphs,
      }
    )

  out = {
    "id": to_safe_id(book_id),
    "title": book_title.strip() or "自定义日语阅读书",
    "level": "基础",
    "tags": ["阅读"],
    "chapters": chapters_out,
  }

  with open(output_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)


def main() -> None:
  ap = argparse.ArgumentParser()
  ap.add_argument("input_json", help="epub-json exported file")
  ap.add_argument("output_json", help="reader-importable book json")
  ap.add_argument("--book-id", default="courage-of-being-disliked-ja")
  ap.add_argument("--book-title", default="")
  args = ap.parse_args()

  convert(
    input_path=args.input_json,
    output_path=args.output_json,
    book_id=args.book_id,
    book_title=args.book_title,
  )
  print(f"Done: {args.output_json}")


if __name__ == "__main__":
  main()

