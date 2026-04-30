"""
Helper: 读取logo SVG并返回base64 data URI，供PDF HTML模板内嵌使用
在pdf_generator代码中 import 或直接调用
"""
import base64
import os

def get_logo_data_uri():
    skill_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.join(skill_dir, 'logo.svg')
    with open(logo_path, 'rb') as f:
        data = f.read()
    b64 = base64.b64encode(data).decode()
    return f'data:image/svg+xml;base64,{b64}'

LOGO_DATA_URI = get_logo_data_uri()
