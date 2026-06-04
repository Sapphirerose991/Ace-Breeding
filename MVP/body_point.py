import cv2
import numpy as np
import json

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

# 按正确顺序定义的名称（请根据您的实际顺序修改）
NAME_SEQUENCE = [
    "Poll",                    # 1
    "Nose",                    # 2
    "Withers",                 # 3
    "Point_of_Back",           # 4
    "Point_of_Hip",            # 5
    "Point_of_Shoulder",       # 6
    "Point_of_Buttock",        # 7
    "Point_of_Elbow",          # 8
    "Stifle",                  # 9
    "Knee-Left",               # 10
    "Knee-Right",              # 11
    "Hock_Left",               # 12
    "Hock_Right",              # 13
    "Fetlock_LeftFront",       # 14
    "Fetlock_RightFront",      # 15
    "Fetlock_LeftHind",        # 16
    "Fetlock_RightHind",       # 17
    "Coronet_LeftFront",       # 18
    "Coronet_RightFront",      # 19
    "Coronet_LeftHind",        # 20
    "Coronet_RightHind"        # 21
]

def manual_click_order(img_path):
    """通过点击按顺序标记点"""
    img = cv2.imread(img_path)
    points = detect_red_points(img_path)
    
    if len(points) != 21:
        print(f"⚠️ 警告: 检测到 {len(points)} 个点，期望 21 个")
    
    # 在图片上标出所有红点并编号
    display_img = img.copy()
    for i, (x, y) in enumerate(points):
        cv2.circle(display_img, (x, y), 8, (0, 255, 0), 2)
        cv2.putText(display_img, str(i), (x-15, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    
    cv2.imwrite("all_detected_points.jpg", display_img)
    print("已保存 all_detected_points.jpg，红点已用数字编号")
    print("\n请按以下顺序点击红点：")
    for i, name in enumerate(NAME_SEQUENCE, 1):
        print(f"  {i}. {name}")
    
    # 显示窗口并等待点击
    cv2.imshow("按顺序点击红点 (按ESC退出)", display_img)
    cv2.setMouseCallback("按顺序点击红点 (按ESC退出)", lambda event, x, y, flags, param: None)
    
    ordered_points = []
    current_idx = 0
    
    def on_click(event, x, y, flags, param):
        nonlocal current_idx
        if event == cv2.EVENT_LBUTTONDOWN and current_idx < len(NAME_SEQUENCE):
            # 找到最近的红点
            distances = [((x - px)**2 + (y - py)**2, i) for i, (px, py) in enumerate(points)]
            closest_dist, closest_idx = min(distances)
            
            if closest_dist < 400:  # 20像素以内
                ordered_points.append(points[closest_idx])
                name = NAME_SEQUENCE[current_idx]
                print(f"✓ 点 {current_idx+1}: {name} -> 坐标 ({points[closest_idx][0]}, {points[closest_idx][1]})")
                current_idx += 1
                
                # 在图上标记已选中的点
                cv2.circle(display_img, points[closest_idx], 8, (0, 0, 255), -1)
                cv2.putText(display_img, name, (points[closest_idx][0]+10, points[closest_idx][1]-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
                cv2.imshow("按顺序点击红点 (按ESC退出)", display_img)
                
                if current_idx == len(NAME_SEQUENCE):
                    print("\n✅ 所有点已标记完成！")
                    cv2.destroyAllWindows()
    
    cv2.setMouseCallback("按顺序点击红点 (按ESC退出)", on_click)
    
    while current_idx < len(NAME_SEQUENCE):
        key = cv2.waitKey(100) & 0xFF
        if key == 27:  # ESC
            print("手动标记已取消")
            cv2.destroyAllWindows()
            return None
    
    cv2.destroyAllWindows()
    
    # 创建标签映射
    labeled_points = {}
    for i, (x, y) in enumerate(ordered_points):
        labeled_points[NAME_SEQUENCE[i]] = (x, y)
    
    return labeled_points, ordered_points

# 主程序
img_path = "yearlingpic/Pixie-knight.png"

print("开始手动标记红点...")
labeled_points, ordered_points = manual_click_order(img_path)

if labeled_points:
    # 保存模板
    template = {
        "point_names": NAME_SEQUENCE,
        "reference_points": ordered_points,
        "image_path": img_path
    }
    
    with open("point_template.json", "w") as f:
        json.dump(template, f, indent=2)
    
    print("\n✅ 模板已保存到 point_template.json")
    
    # 生成带名称的标注图片
    img = cv2.imread(img_path)
    for name, (x, y) in labeled_points.items():
        # 根据部位使用不同颜色
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
    
    # 打印结果
    print("\n最终标记结果：")
    print("="*60)
    for i, name in enumerate(NAME_SEQUENCE):
        if name in labeled_points:
            x, y = labeled_points[name]
            print(f"{i+1:2d}. {name:20s}: ({x:3d}, {y:3d})")
else:
    print("标记失败，请重新运行")
