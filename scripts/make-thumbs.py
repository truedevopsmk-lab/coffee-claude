#!/usr/bin/env python3
"""Generate grid thumbnails for the Brews & Frames gallery.

For every image in assets/gallery/<album>/ this writes a small copy to
assets/gallery-thumbs/<album>/<same filename>: short edge 540px, rotation
baked in, EXIF (including GPS) stripped, colour profile kept. The gallery grid
uses a thumbnail when one exists and falls back to the full image otherwise.

The upload page makes thumbnails itself; run this after adding photos by git:

    python3 scripts/make-thumbs.py            # only missing thumbnails
    python3 scripts/make-thumbs.py --force    # rebuild all
"""
import argparse
import pathlib

from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "gallery"
DST = ROOT / "assets" / "gallery-thumbs"
SHORT_EDGE = 540  # grid tiles are ~170px wide at 3x
FORMATS = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP"}


def make_thumb(src: pathlib.Path, dst: pathlib.Path) -> None:
    with Image.open(src) as original:
        icc = original.info.get("icc_profile")
        im = ImageOps.exif_transpose(original)
        fmt = FORMATS[src.suffix.lower()]
        if fmt == "JPEG" and im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        w, h = im.size
        scale = min(1.0, SHORT_EDGE / min(w, h))
        if scale < 1:
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        options = {"icc_profile": icc} if icc else {}
        if fmt == "JPEG":
            options.update(quality=78, optimize=True, progressive=True)
        elif fmt == "WEBP":
            options.update(quality=78)
        else:
            options.update(optimize=True)
        im.save(dst, fmt, **options)  # no exif= argument, so no EXIF/GPS is written


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate gallery grid thumbnails.")
    parser.add_argument("--force", action="store_true", help="rebuild thumbnails that already exist")
    args = parser.parse_args()

    made = skipped = 0
    for src in sorted(SRC.rglob("*")):
        if not src.is_file() or src.suffix.lower() not in FORMATS:
            continue
        dst = DST / src.relative_to(SRC)
        if dst.exists() and not args.force:
            skipped += 1
            continue
        make_thumb(src, dst)
        made += 1
        print(f"  {dst.relative_to(ROOT)}  {src.stat().st_size // 1024} KB → {dst.stat().st_size // 1024} KB")

    # Drop thumbnails whose full-size image was deleted or renamed
    removed = 0
    if DST.exists():
        for thumb in sorted(DST.rglob("*")):
            if thumb.is_file() and not (SRC / thumb.relative_to(DST)).exists():
                thumb.unlink()
                removed += 1
                print(f"  removed orphan {thumb.relative_to(ROOT)}")

    print(f"{made} written, {skipped} already present, {removed} orphans removed.")


if __name__ == "__main__":
    main()
