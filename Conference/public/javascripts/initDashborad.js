//
//  ImageCut.swift
//  AvailableFonts
//
//  Created by Luoma Zhang on 4/19/15.
//  Copyright (c) 2015 Luoma Zhang. All rights reserved.
//

import Foundation
import UIKit
class ImageCut{
    static let blank = PixelData(r:0, g:0, b:0, a:0)
    static let blue = PixelData(r:0, g:0, b:255, a:255)
    class func cutImageWithLine(rawLine: [CGPoint], image :UIImage) -> [UIImage]?{
        assert(rawLine.count >= 3)
        let rightImage: MutableImage = MutableImage(image: image, empty: false)
        let leftImage: MutableImage = MutableImage(image: image, empty: true)
        let line = rawLine[1...rawLine.count-2]
        let representPoint = line[0]
        var smoothline = Set<MyPoint>()
        //add the first section of smoothline
        let dir1st = (line[0]-rawLine[0]).normalized()
        let leftSideVector = CGPoint(x: -dir1st.y, y: dir1st.x)
        var startPoint = line[0]-dir1st
        while(!rightImage.isVacum(startPoint)){
            smoothline.insert(MyPoint(point: startPoint))
            startPoint -= dir1st
        }
        //complete the mid curve
        if(line.count>1){
            for index in 0...line.count-2{
                let startPoint = line[index]
                let endPoint = line[index+1]
                let dir = (endPoint - startPoint).normalized()
                let len:Int = Int((endPoint - startPoint).length())
                smoothline.insert(MyPoint(point: startPoint))
                for i in 1...len{
                    smoothline.insert(MyPoint(point: startPoint + (dir * CGFloat(i))))
                }
            }
        }
        let dirLast = (rawLine[rawLine.count-1]-line[line.count-1]).normalized()
        startPoint = line[line.count-1]
        while(!rightImage.isVacum(startPoint)){
            smoothline.insert(MyPoint(point: startPoint))
            startPoint += dirLast
        }
        var result = [UIImage]()
        return splitImage(smoothline, image: [rightImage, leftImage], representPoint: representPoint, leftSideVector: leftSideVector)
    }
    class private func splitImage(smoothline: Set<MyPoint>, image :[MutableImage], representPoint: CGPoint, leftSideVector: CGPoint) -> [UIImage]?{
        var result = [UIImage]()
        let startPoint = findNearestPointLeftTo(image[0], representPoint: representPoint, leftSideVector: leftSideVector, smoothline: smoothline)
        if startPoint != nil {
            clearSingleFrom(image, smoothline: smoothline, point: startPoint!)
            return [image[0].getImage(),image[1].getImage()]
        }else{
            return nil
        }
    }
    class private func findNearestPointLeftTo(image: MutableImage, representPoint: CGPoint, leftSideVector: CGPoint, smoothline: Set<MyPoint>) -> MyPoint?{
        var startPoint = representPoint + leftSideVector * 2
        if image.isVacum(startPoint){
            return nil
        }else{
            return MyPoint(point: startPoint)
        }
    }
    class private func clearSingleFrom(image: [MutableImage], smoothline: Set<MyPoint>, point: MyPoint){
        //println("x=\(point.x) and y=\(point.y)")
        var stack = Stack<MyPoint>()
        stack.push(point)
        while !stack.isEmpty(){
            var curr = stack.pop()
            if !(image[0].isVacum(curr.getCGPoint())) && !smoothline.contains(curr){
                image[1].setColor(curr.getCGPoint(), pixelData: image[0].getColor(curr.getCGPoint())!)
                image[0].setVacum(curr.getCGPoint())
                stack.push(MyPoint(x: curr.x, y: curr.y + 1))
                stack.push(MyPoint(x: curr.x + 1, y: curr.y))
                stack.push(MyPoint(x: curr.x - 1, y: curr.y))
                stack.push(MyPoint(x: curr.x, y: curr.y - 1))
            }
        }
    }
}