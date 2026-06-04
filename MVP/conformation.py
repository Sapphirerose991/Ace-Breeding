import cv2
import numpy as np
import json
import math
import pandas as pd
import os
from glob import glob
from scipy.optimize import linear_sum_assignment

# ==================== 1. 模板匹配逻辑 ====================
def match_points_by_template(points, template_points):
    """使用模板匹配点顺序（匈牙利算法）"""
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

# ==================== 2. 红点检测 ====================
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

# ==================== 3. 几何计算函数 ====================
def calculate_distance(p1, p2):
    """计算两点之间的欧氏距离"""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def calculate_angle(p1, p2, p3):
    """计算三点之间的夹角（以p2为顶点）"""
    v1 = (p1[0] - p2[0], p1[1] - p2[1])
    v2 = (p3[0] - p2[0], p3[1] - p2[1])
    
    dot_product = v1[0]*v2[0] + v1[1]*v2[1]
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
    
    if mag1 == 0 or mag2 == 0:
        return 0
    
    cos_angle = dot_product / (mag1 * mag2)
    cos_angle = max(-1, min(1, cos_angle))
    angle_rad = math.acos(cos_angle)
    angle_deg = math.degrees(angle_rad)
    
    return angle_deg

def calculate_pastern_angle(fetlock, coronet):
    """计算系部与水平面的夹角（系部角）公式：sin(theta) = h / p"""
    h = abs(coronet[1] - fetlock[1])  # 垂直高度差
    p = calculate_distance(fetlock, coronet)  # 直线距离
    
    if p == 0:
        return 0
    
    sin_theta = h / p
    sin_theta = max(-1, min(1, sin_theta))
    theta_rad = math.asin(sin_theta)
    theta_deg = math.degrees(theta_rad)
    
    return theta_deg

def calculate_horizontal_angle(p1, p2):
    """计算线段与水平线的夹角（度数）"""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    angle_rad = math.atan2(dy, dx)
    angle_deg = math.degrees(angle_rad)
    return abs(angle_deg)

# ==================== 4. 核心特征计算（修正胸深公式） ====================
def calculate_conformation_features(points_dict):
    """根据21个关键点计算赛马形态学特征"""
    features = {}
    
    # ==================== 一、核心基准线 ====================
    # 前蹄地面平均Y坐标（取左右前冠骨的平均）
    y_ground_front = (points_dict["Coronet_LeftFront"][1] + points_dict["Coronet_RightFront"][1]) / 2
    features["Y_Ground_Front"] = y_ground_front
    
    # 马的基准肩高（Height at Withers）
    withers_y = points_dict["Withers"][1]
    H = abs(y_ground_front - withers_y)  # 使用绝对值确保正数
    features["Height_Withers_pixels"] = H
    
    # ==================== 二、身体比例特征 ====================
    # 1. 头颈长度比例
    head_neck_length = calculate_distance(points_dict["Poll"], points_dict["Withers"])
    features["Head_Neck_Ratio"] = head_neck_length / H if H > 0 else 0
    
    # 2. 躯干长度比例（身长比）
    body_length = calculate_distance(points_dict["Point_of_Shoulder"], points_dict["Point_of_Buttock"])
    features["Body_Length_Ratio"] = body_length / H if H > 0 else 0
    
    # 3. 后躯（臀部）长度比例
    croup_length = calculate_distance(points_dict["Point_of_Hip"], points_dict["Point_of_Buttock"])
    features["Croup_Length_Ratio"] = croup_length / H if H > 0 else 0
    
    # 4. 背腰长度比例
    back_length = calculate_distance(points_dict["Withers"], points_dict["Point_of_Hip"])
    features["Back_Length_Ratio"] = back_length / H if H > 0 else 0
    
    # 5. 腿长与躯干深度比例 (Leg-to-Body Ratio) - 修正版
    # 前腿长：肘部到左前冠骨的直线距离
    front_leg_length = calculate_distance(points_dict["Point_of_Elbow"], points_dict["Coronet_LeftFront"])
    
    # 胸深：鬐甲到肘部的垂直距离（使用绝对值确保正数）
    # 注意：在图像坐标系中，Y轴向下，Withers的Y值小于Elbow的Y值
    chest_depth = abs(points_dict["Withers"][1] - points_dict["Point_of_Elbow"][1])
    
    features["Leg_to_Body_Ratio"] = front_leg_length / chest_depth if chest_depth > 0 else 0
    features["Front_Leg_Length_pixels"] = front_leg_length
    features["Chest_Depth_pixels"] = chest_depth
    
    # ==================== 三、关节角度特征 ====================
    # 6. 斜肩角度
    features["Shoulder_Angle"] = calculate_angle(
        points_dict["Withers"],
        points_dict["Point_of_Shoulder"],
        points_dict["Point_of_Elbow"]
    )
    
    # 7. 左飞节角度
    features["Left_Hock_Angle"] = calculate_angle(
        points_dict["Stifle"],
        points_dict["Hock_Left"],
        points_dict["Fetlock_LeftHind"]
    )
    
    # 8. 右飞节角度
    features["Right_Hock_Angle"] = calculate_angle(
        points_dict["Stifle"],
        points_dict["Hock_Right"],
        points_dict["Fetlock_RightHind"]
    )
    
    # 9. 左膝关节角度
    features["Left_Knee_Angle"] = calculate_angle(
        points_dict["Point_of_Elbow"],
        points_dict["Knee-Left"],
        points_dict["Fetlock_LeftFront"]
    )
    
    # 10. 右膝关节角度
    features["Right_Knee_Angle"] = calculate_angle(
        points_dict["Point_of_Elbow"],
        points_dict["Knee-Right"],
        points_dict["Fetlock_RightFront"]
    )
    
    # 11. 尻部倾斜角
    features["Croup_Angle"] = calculate_horizontal_angle(
        points_dict["Point_of_Hip"],
        points_dict["Point_of_Buttock"]
    )
    
    # 12-15. 系部角度
    features["Left_Front_Pastern_Angle"] = calculate_pastern_angle(
        points_dict["Fetlock_LeftFront"],
        points_dict["Coronet_LeftFront"]
    )
    
    features["Right_Front_Pastern_Angle"] = calculate_pastern_angle(
        points_dict["Fetlock_RightFront"],
        points_dict["Coronet_RightFront"]
    )
    
    features["Left_Hind_Pastern_Angle"] = calculate_pastern_angle(
        points_dict["Fetlock_LeftHind"],
        points_dict["Coronet_LeftHind"]
    )
    
    features["Right_Hind_Pastern_Angle"] = calculate_pastern_angle(
        points_dict["Fetlock_RightHind"],
        points_dict["Coronet_RightHind"]
    )
    
    return features

# ==================== 5. 批量处理函数 ====================
def process_single_image_corrected(img_path, template_points, name_sequence):
    """使用模板匹配处理单张图片"""
    points = detect_red_points(img_path)
    if len(points) != 21:
        print(f"  ⚠️ {os.path.basename(img_path)}: 检测到 {len(points)} 个点，期望 21 个")
        return None

    # 使用模板匹配点顺序
    matched_points = match_points_by_template(points, template_points)
    if matched_points is None:
        return None

    # 创建名称到坐标的映射
    points_dict = {}
    for i, name in enumerate(name_sequence):
        if i < len(matched_points) and matched_points[i] is not None:
            points_dict[name] = matched_points[i]

    # 计算特征
    features = calculate_conformation_features(points_dict)
    return features

def batch_process_images_corrected(image_folder, template_file="point_template.json"):
    """使用模板批量处理"""
    if not os.path.exists(template_file):
        print(f"❌ 模板文件 {template_file} 不存在！")
        return None

    with open(template_file, "r") as f:
        template = json.load(f)

    template_points = template["reference_points"]
    name_sequence = template["point_names"]

    print(f"✅ 已加载模板: {template['image_path']}")
    
    image_paths = glob(os.path.join(image_folder, "*.png")) + \
                  glob(os.path.join(image_folder, "*.jpg")) + \
                  glob(os.path.join(image_folder, "*.jpeg"))
    
    if not image_paths:
        print(f"❌ 在 {image_folder} 中未找到图片文件")
        return None

    print(f"找到 {len(image_paths)} 张图片，开始处理...\n")
    
    all_results = []
    for img_path in sorted(image_paths):
        horse_name = os.path.splitext(os.path.basename(img_path))[0]
        print(f"处理: {horse_name}")
        
        features = process_single_image_corrected(img_path, template_points, name_sequence)
        
        if features:
            features["Horse_Name"] = horse_name
            all_results.append(features)
            print(f"  ✅ 成功 | 胸深: {features['Chest_Depth_pixels']:.1f}px | 腿长/胸深: {features['Leg_to_Body_Ratio']:.3f}")
        else:
            print(f"  ❌ 失败")
    
    if not all_results:
        return None
        
    df = pd.DataFrame(all_results)
    cols = ["Horse_Name"] + [col for col in df.columns if col != "Horse_Name"]
    return df[cols]

# ==================== 6. 保存结果 ====================
def save_results(df, output_path="horse_conformation_features_final.xlsx"):
    """保存结果到Excel"""
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='所有特征', index=False)
        
        ratio_cols = ["Horse_Name"] + [c for c in df.columns if "Ratio" in c or "Height" in c or "Length" in c or "Depth" in c]
        existing_ratio = [c for c in ratio_cols if c in df.columns]
        df[existing_ratio].to_excel(writer, sheet_name='比例特征', index=False)
        
        angle_cols = ["Horse_Name"] + [c for c in df.columns if "Angle" in c]
        existing_angle = [c for c in angle_cols if c in df.columns]
        df[existing_angle].to_excel(writer, sheet_name='角度特征', index=False)
    
    print(f"\n✅ 结果已保存到: {output_path}")

# ==================== 7. 主程序 ====================
def main():
    print("="*80)
    print("赛马形态学特征批量分析系统 (胸深修正版)")
    print("="*80)
    
    df = batch_process_images_corrected("yearlingpic", "point_template.json")
    
    if df is not None:
        save_results(df)
        
        print("\n" + "="*80)
        print("数据验证 (胸深和腿长/胸深比应为正数)")
        print("="*80)
        print(df[['Horse_Name', 'Chest_Depth_pixels', 'Front_Leg_Length_pixels', 'Leg_to_Body_Ratio']].to_string(index=False))
        
        print("\n" + "="*80)
        print("膝关节角度验证 (应接近180°)")
        print("="*80)
        print(df[['Horse_Name', 'Left_Knee_Angle', 'Right_Knee_Angle']].to_string(index=False))

if __name__ == "__main__":
    main()


#Test data