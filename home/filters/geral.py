import cv2

def original(img):
    return img

def negative(img):
    return 255 - img

def gray_scale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
