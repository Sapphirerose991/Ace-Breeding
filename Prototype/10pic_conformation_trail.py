import cv2
import numpy as np
import json
import os
from glob import glob

def detect_red_points(img_path):
    """检测红点"""
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    target_rgb = np.array([231, 25, 31])
    tolerance = 40
    diff = np.abs(img_rgb - target_rgb)
    mask = np.all(diff < tolerance, axis=-1).astype(np.uint8) * 255
    
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    points = []
    for cnt in contours:
        if cv2.contourArea(cnt) > 20:
            M = cv2.moments(cnt)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
                points.append((cX, cY))
    
    return points

def match_points_by_template(points, template_points):
    """
    使用模板匹配点顺序
    通过计算点之间的距离矩阵，找到最佳匹配
    """
    from scipy.optimize import linear_sum_assignment
    
    n_points = len(points)
    n_template = len(template_points)
    
    if n_points != n_template:
        print(f"  ⚠️ 点数不匹配: {n_points} vs {n_template}")
        return None
    
    # 计算距离矩阵
    cost_matrix = np.zeros((n_points, n_template))
    for i, p in enumerate(points):
        for j, tp in enumerate(template_points):
            cost_matrix[i, j] = np.sqrt((p[0] - tp[0])**2 + (p[1] - tp[1])**2)
    
    # 使用匈牙利算法找到最优匹配
    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    
    # 按照模板顺序重新排列点
    matched_points = [None] * n_template
    for r, c in zip(row_ind, col_ind):
        matched_points[c] = points[r]
    
    return matched_points

def create_annotated_image(img_path, output_path, points_dict, template_points=None):
    """创建带标注的图片"""
    img = cv2.imread(img_path)
    
    if img is None:
        print(f"  ❌ 无法读取图片: {img_path}")
        return False
    
    # 定义名称顺序（根据模板）
    name_sequence = [
        "Poll", "Nose", "Withers", "Point_of_Back", "Point_of_Hip",
        "Point_of_Shoulder", "Point_of_Buttock", "Point_of_Elbow", "Stifle",
        "Knee-Left", "Knee-Right", "Hock_Left", "Hock_Right",
        "Fetlock_LeftFront", "Fetlock_RightFront", "Fetlock_LeftHind", "Fetlock_RightHind",
        "Coronet_LeftFront", "Coronet_RightFront", "Coronet_LeftHind", "Coronet_RightHind"
    ]
    
    for name, (x, y) in points_dict.items():
        # 根据部位使用不同颜色
        if "Fetlock" in name or "Coronet" in name:
            color = (255, 100, 100)  # 蓝色系
            circle_color = (255, 50, 50)
        elif "Knee" in name or "Hock" in name:
            color = (0, 255, 255)    # 黄色系
            circle_color = (0, 200, 200)
        else:
            color = (0, 255, 0)      # 绿色系
            circle_color = (0, 200, 0)
        
        # 绘制圆点
        cv2.circle(img, (x, y), 5, circle_color, -1)
        cv2.circle(img, (x, y), 7, (255, 255, 255), 1)
        
        # 绘制文字标签
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.35
        thickness = 1
        
        (text_w, text_h), _ = cv2.getTextSize(name, font, font_scale, thickness)
        
        # 绘制文字背景
        cv2.rectangle(img, (x + 3, y - text_h - 4), 
                     (x + 3 + text_w, y - 2), (0, 0, 0), -1)
        
        # 绘制文字
        cv2.putText(img, name, (x + 4, y - 4), 
                   font, font_scale, color, thickness)
    
    # 保存图片
    cv2.imwrite(output_path, img)
    return True

def manual_click_order(img_path):
    """通过点击按顺序标记点（用于创建模板）"""
    img = cv2.imread(img_path)
    points = detect_red_points(img_path)
    
    if len(points) != 21:
        print(f"⚠️ 警告: 检测到 {len(points)} 个点，期望 21 个")
        return None, None
    
    name_sequence = [
        "Poll", "Nose", "Withers", "Point_of_Back", "Point_of_Hip",
        "Point_of_Shoulder", "Point_of_Buttock", "Point_of_Elbow", "Stifle",
        "Knee-Left", "Knee-Right", "Hock_Left", "Hock_Right",
        "Fetlock_LeftFront", "Fetlock_RightFront", "Fetlock_LeftHind", "Fetlock_RightHind",
        "Coronet_LeftFront", "Coronet_RightFront", "Coronet_LeftHind", "Coronet_RightHind"
    ]
    
    # 在图片上标出所有红点并编号
    display_img = img.copy()
    for i, (x, y) in enumerate(points):
        cv2.circle(display_img, (x, y), 8, (0, 255, 0), 2)
        cv2.putText(display_img, str(i), (x-15, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    
    cv2.imwrite("all_detected_points.jpg", display_img)
    print("已保存 all_detected_points.jpg，红点已用数字编号")
    print("\n请按以下顺序点击红点：")
    for i, name in enumerate(name_sequence, 1):
        print(f"  {i}. {name}")
    
    cv2.imshow("按顺序点击红点 (按ESC退出)", display_img)
    
    ordered_points = []
    current_idx = 0
    
    def on_click(event, x, y, flags, param):
        nonlocal current_idx
        if event == cv2.EVENT_LBUTTONDOWN and current_idx < len(name_sequence):
            # 找到最近的红点
            distances = [((x - px)**2 + (y - py)**2, i) for i, (px, py) in enumerate(points)]
            closest_dist, closest_idx = min(distances)
            
            if closest_dist < 400:
                ordered_points.append(points[closest_idx])
                name = name_sequence[current_idx]
                print(f"✓ 点 {current_idx+1}: {name} -> 坐标 ({points[closest_idx][0]}, {points[closest_idx][1]})")
                current_idx += 1
                
                cv2.circle(display_img, points[closest_idx], 8, (0, 0, 255), -1)
                cv2.putText(display_img, name, (points[closest_idx][0]+10, points[closest_idx][1]-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
                cv2.imshow("按顺序点击红点 (按ESC退出)", display_img)
                
                if current_idx == len(name_sequence):
                    print("\n✅ 所有点已标记完成！")
                    cv2.destroyAllWindows()
    
    cv2.setMouseCallback("按顺序点击红点 (按ESC退出)", on_click)
    
    while current_idx < len(name_sequence):
        key = cv2.waitKey(100) & 0xFF
        if key == 27:
            print("手动标记已取消")
            cv2.destroyAllWindows()
            return None, None
    
    cv2.destroyAllWindows()
    
    labeled_points = {}
    for i, (x, y) in enumerate(ordered_points):
        labeled_points[name_sequence[i]] = (x, y)
    
    return labeled_points, ordered_points

def batch_annotate_with_template(input_folder, output_folder, template_file="point_template.json"):
    """使用模板批量标注图片"""
    
    # 检查模板文件
    if not os.path.exists(template_file):
        print(f"❌ 模板文件 {template_file} 不存在！")
        print("请先运行手动标注创建模板。")
        return 0, 0
    
    # 加载模板
    with open(template_file, "r") as f:
        template = json.load(f)
    
    template_points = template["reference_points"]
    name_sequence = template["point_names"]
    
    print(f"✅ 已加载模板: {template['image_path']}")
    print(f"   模板包含 {len(template_points)} 个点")
    
    # 创建输出文件夹
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"✅ 创建输出文件夹: {output_folder}")
    
    # 获取所有图片
    image_paths = glob(os.path.join(input_folder, "*.png")) + \
                  glob(os.path.join(input_folder, "*.jpg")) + \
                  glob(os.path.join(input_folder, "*.jpeg"))
    
    if not image_paths:
        print(f"❌ 在 {input_folder} 中未找到图片文件")
        return 0, 0
    
    print(f"\n找到 {len(image_paths)} 张图片")
    print("="*80)
    
    success_count = 0
    fail_count = 0
    
    for img_path in sorted(image_paths):
        horse_name = os.path.splitext(os.path.basename(img_path))[0]
        print(f"\n处理: {horse_name}")
        
        # 检测红点
        points = detect_red_points(img_path)
        
        if len(points) != 21:
            print(f"  ⚠️ 检测到 {len(points)} 个点，期望 21 个")
            fail_count += 1
            continue
        
        # 使用模板匹配点顺序
        matched_points = match_points_by_template(points, template_points)
        
        if matched_points is None:
            print(f"  ❌ 点匹配失败")
            fail_count += 1
            continue
        
        # 创建名称到坐标的映射
        points_dict = {}
        for i, name in enumerate(name_sequence):
            if i < len(matched_points):
                points_dict[name] = matched_points[i]
        
        # 输出文件路径
        output_path = os.path.join(output_folder, f"{horse_name}_marked.jpg")
        
        # 创建标注图片
        if create_annotated_image(img_path, output_path, points_dict):
            print(f"  ✅ 已保存: {os.path.basename(output_path)}")
            success_count += 1
        else:
            print(f"  ❌ 标注失败")
            fail_count += 1
    
    return success_count, fail_count

def create_template_first():
    """首先创建模板（手动标注第一张图片）"""
    img_path = "yearlingpic/Pixie-knight.png"
    
    print("="*80)
    print("第一步：创建模板（手动标注）")
    print("="*80)
    
    labeled_points, ordered_points = manual_click_order(img_path)
    
    if labeled_points:
        template = {
            "point_names": [
                "Poll", "Nose", "Withers", "Point_of_Back", "Point_of_Hip",
                "Point_of_Shoulder", "Point_of_Buttock", "Point_of_Elbow", "Stifle",
                "Knee-Left", "Knee-Right", "Hock_Left", "Hock_Right",
                "Fetlock_LeftFront", "Fetlock_RightFront", "Fetlock_LeftHind", "Fetlock_RightHind",
                "Coronet_LeftFront", "Coronet_RightFront", "Coronet_LeftHind", "Coronet_RightHind"
            ],
            "reference_points": ordered_points,
            "image_path": img_path
        }
        
        with open("point_template.json", "w") as f:
            json.dump(template, f, indent=2)
        
        print("\n✅ 模板已保存到 point_template.json")
        
        # 生成标注图片
        img = cv2.imread(img_path)
        for name, (x, y) in labeled_points.items():
            if "Fetlock" in name or "Coronet" in name:
                color = (255, 100, 100)
            elif "Knee" in name or "Hock" in name:
                color = (0, 255, 255)
            else:
                color = (0, 255, 0)
            
            cv2.putText(img, name, (x+5, y-8), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
            cv2.circle(img, (x, y), 4, (0, 0, 255), -1)
        
        cv2.imwrite("labeled_points_manual.jpg", img)
        print("已保存 labeled_points_manual.jpg")
        
        return True
    else:
        print("❌ 模板创建失败")
        return False

def main():
    # 检查模板是否存在
    if not os.path.exists("point_template.json"):
        print("未找到模板文件，请先手动标注第一张图片创建模板\n")
        input("按 Enter 键开始手动标注...")
        
        if not create_template_first():
            return
    
    print("\n" + "="*80)
    print("第二步：批量标注所有图片")
    print("="*80)
    
    # 批量标注
    input_folder = "yearlingpic"
    output_folder = "marked_yearlings"
    
    success, fail = batch_annotate_with_template(input_folder, output_folder)
    
    print("\n" + "="*80)
    print("处理完成总结")
    print("="*80)
    print(f"✅ 成功处理: {success} 张")
    print(f"❌ 处理失败: {fail} 张")
    print(f"📁 标注图片已保存到: {output_folder}")

if __name__ == "__main__":
    main()