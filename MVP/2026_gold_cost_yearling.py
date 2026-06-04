import requests
import os
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import pandas as pd
from tqdm import tqdm

class MagicMillionsScraper:
    def __init__(self):
        self.base_url = "https://catalogue.magicmillions.com.au"
        self.sale_code = "26GPR"
        self.lot_total = 100  # 只爬取前100匹
        self.image_folder = "2026_gold_cost_yearling_pic"
        self.excel_file = "2026_gold_cost_yearling.xlsx"
        
        # 创建图片文件夹
        if not os.path.exists(self.image_folder):
            os.makedirs(self.image_folder)
        
        # 请求头
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': self.base_url
        }
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def get_lot_page(self, lot_number):
        """获取单个Lot的页面"""
        url = f"{self.base_url}/lot/{self.sale_code}/{lot_number}"
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"获取Lot {lot_number} 失败: {e}")
            return None
    
    def download_image(self, img_url, lot_number, img_type='photo'):
        """下载图片到本地文件夹"""
        if not img_url:
            return None
        
        # 确保URL是完整的
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif img_url.startswith('/'):
            img_url = urljoin(self.base_url, img_url)
        
        # 确定文件扩展名
        parsed_url = urlparse(img_url)
        path = parsed_url.path
        if '.' in path:
            ext = path.split('.')[-1].split('?')[0]
            if len(ext) > 5:
                ext = 'jpg'
        else:
            ext = 'jpg'
        
        # 生成文件名（统一使用jpg扩展名）
        filename = f"lot_{lot_number}_{img_type}.{ext}"
        filepath = os.path.join(self.image_folder, filename)
        
        # 如果文件已存在，跳过下载
        if os.path.exists(filepath):
            return filepath
        
        try:
            headers = self.headers.copy()
            headers['Referer'] = f"{self.base_url}/lot/{self.sale_code}/{lot_number}"
            
            response = self.session.get(img_url, headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            
            # 检查内容类型
            content_type = response.headers.get('content-type', '')
            if 'image' not in content_type:
                return None
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            time.sleep(0.1)  # 避免请求过快
            return filepath
            
        except Exception as e:
            return None
    
    def extract_lot_data(self, html, lot_number):
        """从页面提取所需数据"""
        soup = BeautifulSoup(html, 'html.parser')
        data = {
            'Lot': lot_number,
            'Sire': '',
            'Dam': '',
            'Price': '',
            'Buyer': '',
            'Photo_Path': ''
        }
        
        # 提取基本信息（从particulars表格）
        particulars_table = soup.find('table', class_='pedigreesummary')
        if particulars_table:
            rows = particulars_table.find_all('tr')
            for row in rows:
                th = row.find('th')
                td = row.find('td')
                if th and td:
                    th_text = th.get_text().strip()
                    td_text = td.get_text().strip()
                    
                    if 'Sire:' in th_text:
                        data['Sire'] = td_text
                    elif 'Dam:' in th_text:
                        data['Dam'] = td_text
                    elif 'Buyer:' in th_text:
                        # Buyer字段包含价格和买家信息
                        data['Buyer'] = td_text
                        # 提取价格（通常是$符号后的数字）
                        price_match = re.search(r'\$([\d,]+)', td_text)
                        if price_match:
                            price_str = price_match.group(1).replace(',', '')
                            data['Price'] = int(price_str)
                        elif 'Passed' in td_text or 'Withdrawn' in td_text:
                            data['Price'] = td_text.strip()
                        else:
                            data['Price'] = ''
        
        # 提取标准照片
        # 方法1：查找mediapreview类的图片
        photo_img = soup.find('img', class_='mediapreview')
        if not photo_img:
            # 方法2：查找lotphoto区域的图片
            photo_img = soup.find('img', {'class': 'lotphoto'})
        if not photo_img:
            # 方法3：查找任何在lotmedia区域的图片
            lotmedia = soup.find('section', class_='lotmedia')
            if lotmedia:
                photo_img = lotmedia.find('img')
        
        if photo_img and photo_img.get('src'):
            photo_url = photo_img['src']
            data['Photo_Path'] = self.download_image(photo_url, lot_number, 'photo')
        
        return data
    
    def scrape_all_lots(self):
        """爬取前100匹Lot的数据"""
        all_data = []
        start_lot = 1
        end_lot = self.lot_total
        
        print(f"开始爬取 {self.sale_code} 拍卖会，共 {end_lot} 匹马（前100匹）")
        print(f"图片将保存到: {self.image_folder}")
        print("-" * 60)
        
        # 使用tqdm显示进度条
        for lot_num in tqdm(range(start_lot, end_lot + 1), desc="爬取进度", unit="匹"):
            html = self.get_lot_page(lot_num)
            if html:
                data = self.extract_lot_data(html, lot_num)
                all_data.append(data)
                
                # 实时显示刚爬取的数据
                if data['Price']:
                    price_display = f"${data['Price']:,}" if isinstance(data['Price'], int) else data['Price']
                else:
                    price_display = "N/A"
                tqdm.write(f"  Lot {lot_num}: {data['Sire']} x {data['Dam']} - {price_display}")
            else:
                tqdm.write(f"  Lot {lot_num}: 爬取失败")
                all_data.append({
                    'Lot': lot_num,
                    'Sire': 'ERROR',
                    'Dam': 'ERROR',
                    'Price': 'ERROR',
                    'Buyer': 'ERROR',
                    'Photo_Path': ''
                })
            
            # 添加延迟，避免请求过快
            time.sleep(0.3)
        
        return all_data
    
    def save_to_excel(self, data):
        """保存数据到Excel并嵌入图片路径"""
        df = pd.DataFrame(data)
        
        # 调整列顺序
        columns_order = ['Lot', 'Sire', 'Dam', 'Price', 'Buyer', 'Photo_Path']
        df = df[columns_order]
        
        # 处理Price列显示格式
        def format_price(price):
            if isinstance(price, int):
                return f"${price:,}"
            return price
        
        df['Price_Display'] = df['Price'].apply(format_price)
        
        # 保存到Excel
        with pd.ExcelWriter(self.excel_file, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Yearlings', index=False)
            
            # 调整列宽
            worksheet = writer.sheets['Yearlings']
            column_widths = {
                'A': 8,   # Lot
                'B': 25,  # Sire
                'C': 25,  # Dam
                'D': 15,  # Price
                'E': 40,  # Buyer
                'F': 50,  # Photo_Path
                'G': 15   # Price_Display
            }
            
            for col, width in column_widths.items():
                worksheet.column_dimensions[col].width = width
        
        print(f"\n数据已保存到: {self.excel_file}")
        print(f"共保存 {len(data)} 条记录")
        
        # 统计信息
        sold = sum(1 for d in data if isinstance(d.get('Price'), int))
        passed = sum(1 for d in data if isinstance(d.get('Price'), str) and 'Passed' in d['Price'])
        withdrawn = sum(1 for d in data if isinstance(d.get('Price'), str) and 'Withdrawn' in d['Price'])
        error = sum(1 for d in data if d.get('Price') == 'ERROR')
        photos_downloaded = sum(1 for d in data if d.get('Photo_Path') and os.path.exists(d['Photo_Path']))
        
        print(f"\n统计信息:")
        print(f"  总马匹数: {len(data)}")
        print(f"  已售出: {sold}")
        print(f"  流拍: {passed}")
        print(f"  退出: {withdrawn}")
        print(f"  爬取失败: {error}")
        print(f"  照片下载成功: {photos_downloaded}/{len(data)}")
        
        # 价格统计（仅统计已售出的）
        prices = [d['Price'] for d in data if isinstance(d.get('Price'), int)]
        if prices:
            print(f"\n价格统计（已售出）:")
            print(f"  最高价: ${max(prices):,}")
            print(f"  最低价: ${min(prices):,}")
            print(f"  平均价: ${sum(prices)//len(prices):,}")
    
    def run(self):
        """运行爬虫"""
        print("=" * 60)
        print("Magic Millions 2026 Gold Coast Yearling Sale 数据爬虫")
        print("爬取范围: Lot 1 至 100")
        print("=" * 60)
        
        # 爬取所有数据
        all_data = self.scrape_all_lots()
        
        # 保存到Excel
        self.save_to_excel(all_data)
        
        print("\n" + "=" * 60)
        print("爬取完成！")
        print(f"照片保存在: {self.image_folder}/")
        print(f"数据保存在: {self.excel_file}")
        print("=" * 60)

if __name__ == "__main__":
    scraper = MagicMillionsScraper()
    scraper.run()