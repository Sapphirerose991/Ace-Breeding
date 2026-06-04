import requests
from bs4 import BeautifulSoup
import re
import os
import time
import pandas as pd
from urllib.parse import urljoin

def crawl_silk_horse_club():
    """
    爬取 Silk Horse Club 的募集马信息
    输出：Excel文件（包含马名、英文名、父、母、母父、募集额）+ 图片文件夹
    """
    
    list_url = "https://www.silkhorseclub.jp/horse_info/boshu/list"
    base_url = "https://www.silkhorseclub.jp"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    # 创建保存图片的文件夹
    image_folder = "silk_yearling_pic"
    if not os.path.exists(image_folder):
        os.makedirs(image_folder)
    
    horses_data = []
    
    print("正在获取列表页...")
    try:
        response = requests.get(list_url, headers=headers)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
    except requests.RequestException as e:
        print(f"获取列表页失败: {e}")
        return horses_data
    
    # 查找所有马匹条目
    horse_boxes = soup.find_all('div', class_='horseDataBox')
    print(f"找到 {len(horse_boxes)} 匹马")
    
    for idx, box in enumerate(horse_boxes, 1):
        print(f"\n[{idx}/{len(horse_boxes)}] 正在处理...")
        
        horse_info = {
            '日文名': '',
            '英文名': '',
            '父': '',
            '母': '',
            '母父': '',
            '募集额': ''
        }
        
        # 1. 获取马名和编号
        name_tag = box.find('h2')
        if name_tag:
            name_text = name_tag.get_text(strip=True)
            match = re.match(r'(\d+)\.(.+)', name_text)
            if match:
                horse_info['number'] = match.group(1)
                horse_info['日文名'] = match.group(2)
            else:
                horse_info['number'] = str(idx)
                horse_info['日文名'] = name_text
        else:
            horse_info['number'] = str(idx)
            horse_info['日文名'] = '未知'
        
        # 2. 获取募集总额
        total_price_tag = box.find('dl', class_='totalPrice')
        if total_price_tag:
            price_dd = total_price_tag.find('dd')
            if price_dd:
                horse_info['募集额'] = price_dd.get_text(strip=True)
            else:
                horse_info['募集额'] = '未知'
        else:
            horse_info['募集额'] = '未知'
        
        # 3. 从列表页获取父母信息
        horse_data_list = box.find('div', class_='horseDataList')
        if horse_data_list:
            dls = horse_data_list.find_all('dl')
            for dl in dls:
                dt = dl.find('dt')
                dd = dl.find('dd')
                if dt and dd:
                    key = dt.get_text(strip=True)
                    value = dd.get_text(strip=True)
                    if key == '父':
                        horse_info['父'] = value
                    elif key == '母':
                        horse_info['母'] = value
                    elif key == '母の父':
                        horse_info['母父'] = value
        
        # 4. 获取详情页链接
        detail_link = box.find('a', class_='c-btn--link--blue--horseListDetail')
        if detail_link and detail_link.get('href'):
            horse_info['detail_url'] = urljoin(base_url, detail_link.get('href'))
        else:
            horse_info['detail_url'] = None
        
        # 5. 初始化照片信息
        horse_info['image_url'] = None
        horse_info['image_filename'] = None
        
        # 6. 访问详情页获取英文名和NF照片
        if horse_info.get('detail_url'):
            print(f"   访问详情页: {horse_info['detail_url']}")
            try:
                detail_response = requests.get(horse_info['detail_url'], headers=headers, timeout=15)
                detail_response.raise_for_status()
                detail_response.encoding = 'utf-8'
                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                
                # 从详情页获取更准确的父母信息、募集额和英文名
                detail_info_section = detail_soup.find('div', class_='horseDataList')
                if detail_info_section:
                    horse_data_contents = detail_info_section.find('div', class_='horseDataContents')
                    if horse_data_contents:
                        dls = horse_data_contents.find_all('dl')
                        for dl in dls:
                            dt = dl.find('dt')
                            dd = dl.find('dd')
                            if dt and dd:
                                key = dt.get_text(strip=True)
                                value = dd.get_text(strip=True)
                                if key == '父':
                                    horse_info['父'] = value
                                elif key == '母':
                                    horse_info['母'] = value
                                elif key == '母の父':
                                    horse_info['母父'] = value
                                elif key == '募集総額 / 一口出資額':
                                    horse_info['募集额'] = value
                                elif key == '英語名':
                                    horse_info['英文名'] = value
                
                # 如果上面没找到英文名，尝试其他位置
                if not horse_info['英文名']:
                    # 有些页面英文名可能在其他地方
                    eng_name_tag = detail_soup.find('dt', string='英語名')
                    if eng_name_tag:
                        eng_name_dd = eng_name_tag.find_next('dd')
                        if eng_name_dd:
                            horse_info['英文名'] = eng_name_dd.get_text(strip=True)
                
                # ========== 查找一岁马体照片（NFイヤリング） ==========
                photo_section = detail_soup.find('ul', class_='c-list_horseDetailSlide')
                if photo_section:
                    photo_items = photo_section.find_all('li')
                    for item in photo_items:
                        text_p = item.find('p', class_='text')
                        if text_p and 'NFイヤリング' in text_p.get_text():
                            img_div = item.find('div', class_='img')
                            if img_div:
                                img_tag = img_div.find('img')
                                if img_tag and img_tag.get('src'):
                                    img_src = img_tag.get('src')
                                    if img_src.startswith('http'):
                                        horse_info['image_url'] = img_src
                                    else:
                                        horse_info['image_url'] = urljoin(base_url, img_src)
                                    
                                    # 生成图片文件名：编号_日文名_英文名.jpg
                                    safe_jp_name = re.sub(r'[\\/*?:"<>|]', '_', horse_info['日文名'])
                                    safe_en_name = re.sub(r'[\\/*?:"<>|]', '_', horse_info['英文名']) if horse_info['英文名'] else 'no_eng_name'
                                    horse_info['image_filename'] = f"{horse_info['number']}_{safe_jp_name}_{safe_en_name}.jpg"
                                    print(f"   找到NF一岁马体照片")
                                    break
                
                # 如果没有找到NFイヤリング，尝试查找其他马体照片
                if not horse_info['image_url']:
                    all_images = detail_soup.find_all('img')
                    for img in all_images:
                        img_src = img.get('src', '')
                        if '/detail_gallery/' in img_src:
                            if img_src.startswith('http'):
                                horse_info['image_url'] = img_src
                            else:
                                horse_info['image_url'] = urljoin(base_url, img_src)
                            safe_jp_name = re.sub(r'[\\/*?:"<>|]', '_', horse_info['日文名'])
                            safe_en_name = re.sub(r'[\\/*?:"<>|]', '_', horse_info['英文名']) if horse_info['英文名'] else 'no_eng_name'
                            horse_info['image_filename'] = f"{horse_info['number']}_{safe_jp_name}_{safe_en_name}.jpg"
                            print(f"   找到马体照片")
                            break
                
                # 下载图片
                if horse_info['image_url']:
                    try:
                        img_response = requests.get(horse_info['image_url'], headers=headers, timeout=10)
                        img_response.raise_for_status()
                        
                        image_path = os.path.join(image_folder, horse_info['image_filename'])
                        with open(image_path, 'wb') as f:
                            f.write(img_response.content)
                        print(f"   图片已保存: {horse_info['image_filename']}")
                    except Exception as e:
                        print(f"   下载图片失败: {e}")
                        horse_info['image_filename'] = None
                else:
                    print(f"   未找到NF一岁马体照片")
                
                time.sleep(0.5)  # 避免请求过快
                
            except requests.RequestException as e:
                print(f"   访问详情页失败: {e}")
        else:
            print(f"   没有详情页链接")
        
        # 存储马匹信息（用于Excel）
        horses_data.append({
            '日文名': horse_info['日文名'],
            '英文名': horse_info.get('英文名', ''),
            '父': horse_info['父'],
            '母': horse_info['母'],
            '母父': horse_info.get('母父', ''),
            '募集额': horse_info['募集额'],
            '图片文件名': horse_info.get('image_filename', '未找到'),
            '图片URL': horse_info.get('image_url', '')
        })
        
        # 打印提取的信息
        print(f"   日文名: {horse_info['日文名']}")
        print(f"   英文名: {horse_info.get('英文名', '未找到')}")
        print(f"   父: {horse_info['父']}")
        print(f"   母: {horse_info['母']}")
        print(f"   母父: {horse_info.get('母父', '未知')}")
        print(f"   募集额: {horse_info['募集额']}")
        
        time.sleep(0.3)  # 控制请求频率
    
    return horses_data

def save_to_excel(horses_data, filename="silk_horse_club_data.xlsx"):
    """将数据保存为Excel文件"""
    if not horses_data:
        print("没有数据可保存")
        return
    
    # 创建DataFrame
    df = pd.DataFrame(horses_data)
    
    # 调整列顺序
    columns_order = ['日文名', '英文名', '父', '母', '母父', '募集额', '图片文件名', '图片URL']
    df = df[columns_order]
    
    # 保存为Excel文件
    try:
        # 需要安装 openpyxl: pip install openpyxl
        df.to_excel(filename, index=False, engine='openpyxl')
        print(f"\n数据已保存到: {filename}")
    except Exception as e:
        print(f"保存Excel文件失败: {e}")
        print("请确保已安装 openpyxl: pip install openpyxl")
        # 备用方案：保存为CSV
        csv_filename = filename.replace('.xlsx', '.csv')
        df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"已保存为CSV备用文件: {csv_filename}")

def display_summary(horses_data):
    """显示汇总信息"""
    if not horses_data:
        print("没有数据")
        return
    
    print("\n" + "="*60)
    print("爬取完成汇总")
    print("="*60)
    print(f"总共处理马匹数: {len(horses_data)}")
    
    # 统计照片下载情况
    downloaded = sum(1 for h in horses_data if h['图片文件名'] != '未找到')
    print(f"成功下载照片: {downloaded}/{len(horses_data)} 匹")
    
    # 统计英文名获取情况
    has_eng_name = sum(1 for h in horses_data if h['英文名'] and h['英文名'] != '')
    print(f"获取到英文名: {has_eng_name}/{len(horses_data)} 匹")
    
    print("\n前5匹马信息预览:")
    print("-"*80)
    for i, horse in enumerate(horses_data[:5], 1):
        print(f"{i}. {horse['日文名']}")
        print(f"   英文名: {horse['英文名'] or '未找到'}")
        print(f"   父: {horse['父']} | 母: {horse['母']} | 母父: {horse['母父']}")
        print(f"   募集额: {horse['募集额']}")
        print(f"   照片: {horse['图片文件名']}")
        print()

if __name__ == "__main__":
    print("=" * 60)
    print("Silk Horse Club 募集马信息爬虫")
    print("=" * 60)
    print("\n输出说明：")
    print("1. Excel文件: silk_horse_club_data.xlsx")
    print("   - 包含字段：日文名、英文名、父、母、母父、募集额、图片文件名")
    print("2. 图片文件夹: silk_yearling_pic/")
    print("   - 图片命名格式：编号_日文名_英文名.jpg")
    print("\n开始爬取...")
    print("-" * 60)
    
    # 安装依赖提示
    try:
        import pandas
        import openpyxl
    except ImportError:
        print("请先安装所需依赖:")
        print("pip install pandas openpyxl requests beautifulsoup4")
        exit(1)
    
    # 运行爬虫
    result = crawl_silk_horse_club()
    
    # 保存Excel
    if result:
        save_to_excel(result)
        display_summary(result)
        
        # 显示图片保存位置
        print(f"\n图片保存在: {os.path.abspath('silk_yearling_pic')}")
    else:
        print("\n未获取到任何数据，请检查网络连接或网站结构是否变化")