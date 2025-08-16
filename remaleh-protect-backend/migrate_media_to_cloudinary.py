#!/usr/bin/env python3
"""
One-off migration script to upload local media files to Cloudinary and update DB URLs.
Usage: Set Cloudinary env vars and run: python3 migrate_media_to_cloudinary.py
"""
import os
import sys

from dotenv import load_dotenv

load_dotenv()

try:
    from src.main import create_app
    from src.models import db, CommunityReportMedia
except ImportError:
    from main import create_app
    from models import db, CommunityReportMedia

try:
    import cloudinary
    import cloudinary.uploader
except ImportError:
    print("cloudinary package not installed. Add to requirements and install.")
    sys.exit(1)


def main():
    app = create_app()
    with app.app_context():
        cloud_name = app.config.get('CLOUDINARY_CLOUD_NAME')
        api_key = app.config.get('CLOUDINARY_API_KEY')
        api_secret = app.config.get('CLOUDINARY_API_SECRET')
        if not (cloud_name and api_key and api_secret):
            print("Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET")
            sys.exit(1)

        cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret, secure=True)

        upload_folder = app.config.get('UPLOAD_FOLDER')
        migrated = 0
        failed = 0

        media_list = CommunityReportMedia.query.filter(CommunityReportMedia.media_url.like('/api/community/uploads/%')).all()
        for m in media_list:
            try:
                filename = m.media_url.split('/api/community/uploads/', 1)[1]
                file_path = os.path.join(upload_folder, filename)
                if not os.path.exists(file_path):
                    print(f"Skip media_id={m.id} missing file: {file_path}")
                    failed += 1
                    continue
                result = cloudinary.uploader.upload(file_path, folder='community_reports', resource_type='image', use_filename=True, unique_filename=True)
                new_url = result.get('secure_url') or result.get('url')
                if new_url:
                    m.media_url = new_url
                    m.media_type = result.get('resource_type', m.media_type)
                    db.session.add(m)
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                    migrated += 1
                else:
                    print(f"Upload returned no URL for media_id={m.id}")
                    failed += 1
            except Exception as ex:
                print(f"Failed media_id={m.id}: {ex}")
                failed += 1

        db.session.commit()
        print(f"Done. Migrated: {migrated}, Failed: {failed}")


if __name__ == '__main__':
    main()


