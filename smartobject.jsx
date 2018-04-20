test();

function test() {
    var layer = app.activeDocument.activeLayer;
    var scale = getSmartObjectScale (layer);
    var size = getSmartObjectSize (layer);
    var corners = getSmartObjectCorners (layer);
    var bounds = get_reference_bounds (layer);
    var angle = getSmartObjectAngle (layer);
    $.writeln("Hello Songgeb!");
}

//scale，使用说明scale.width & size.height
function getSmartObjectScale (layer) {
    if (layer.kind != LayerKind.SMARTOBJECT) {alert("layer is not smart object!"); return null;}
     var originalActiveLayer = app.activeDocument.activeLayer;
     app.activeDocument.activeLayer = layer;
     //获取智能对象当前尺寸
     var originalSize = getSmartObjectSize (layer);
    //进入智能对象编辑页面，获取智能对象原尺寸
    var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
    var desc1900 = new ActionDescriptor();
    executeAction( idplacedLayerEditContents, desc1900, DialogModes.NO );//进入对象编辑页面
    //获取文档大小
    var width = app.activeDocument.width.value;
    var height = app.activeDocument.height.value;
    
    app.activeDocument.close (SaveOptions.DONOTSAVECHANGES);
    app.activeDocument.activeLayer = originalActiveLayer;
    
    return {"width": originalSize.width/width, "height": originalSize.height/height};
}

//返回size，使用方法size.width & size.height
function getSmartObjectSize (layer) {
    if (layer.kind != LayerKind.SMARTOBJECT) {alert("layer is not smart object!"); return null;}
    var originalActiveLayer = app.activeDocument.activeLayer;
     app.activeDocument.activeLayer = layer;

    var corners = getSmartObjectCorners (layer);
    var yWDiff = corners[1][1]-corners[0][1];
    var xWDiff = corners[1][0]-corners[0][0];
    var xHDiff = corners[3][0] - corners[0][0];
    var yHDiff = corners[3][1] - corners[0][1];
    var width = Math.sqrt (yWDiff * yWDiff + xWDiff*xWDiff);
    var height = Math.sqrt (yHDiff * yHDiff + xHDiff*xHDiff);
    
    app.activeDocument.activeLayer = originalActiveLayer;
    return {"width":width, "height":height};
}

//求layer的最小包围矩形
//如果是smartobject，且没有旋转，则返回值相当于smartobject图层参考点的bounds
function get_reference_bounds(layer)  
{  
    try  
        {  
        if (layer.kind == LayerKind.SMARTOBJECT)  
            {  
            var layer0 = activeDocument.activeLayer;  
            activeDocument.activeLayer = layer;
            var corners = getSmartObjectCorners (layer);
            var l = [Math.min(corners[3][0], Math.min(corners[2][0], Math.min(corners[1][0], corners[0][0]))) ];  
            var r = [Math.max(corners[3][0], Math.max(corners[2][0], Math.max(corners[1][0], corners[0][0]))) ];  
  
            var t = [Math.min(corners[3][1], Math.min(corners[2][1], Math.min(corners[1][1], corners[0][1]))) ];  
            var b = [Math.max(corners[3][1], Math.max(corners[2][1], Math.max(corners[1][1], corners[0][1]))) ];  
  
            activeDocument.activeLayer = layer0;  
            return [ UnitValue(l,"px"), UnitValue(t,"px"), UnitValue(r,"px"), UnitValue(b,"px") ];  
            }  
        else  
            return layer.boundsNoEffects;  
        }  
    catch (e) { alert(e); }  
}

function getSmartObjectCorners(layer)
{
    if (layer.kind != LayerKind.SMARTOBJECT) {alert("layer is not smart object!"); return null;}
    var originalActiveLayer = app.activeDocument.activeLayer;
     app.activeDocument.activeLayer = layer;
     
    var r = new ActionReference();
    r.putEnumerated( stringIDToTypeID( "layer" ), stringIDToTypeID( "ordinal" ), stringIDToTypeID( "targetEnum" ) );
    var d;
    try { d = executeActionGet(r); } catch (e) { alert(e); return; }
    try { d = d.getObjectValue(stringIDToTypeID("smartObjectMore"));    } catch (e) { alert(e); return; }
    try { d = d.getList(stringIDToTypeID("transform"));                 } catch (e) { alert(e); return; }
     //(0,1),(2,3),(4,5),(6,7)的分布是左上、右上、右下、左下
    var ret = [[d.getDouble(0),d.getDouble(1)],
                   [d.getDouble(2),d.getDouble(3)],
                   [d.getDouble(4),d.getDouble(5)],
                   [d.getDouble(6),d.getDouble(7)]];

    app.activeDocument.activeLayer = originalActiveLayer;
    return ret;
}

//计算智能对象的角度
function getSmartObjectAngle (layer) {
    if (layer.kind != LayerKind.SMARTOBJECT) {alert("layer is not smart object!"); return null;}
    var points = getSmartObjectCorners (layer);
    var w = points[0][0] - points[1][0];
    var h = points[0][1] - points[1][1];
    var angle = (Math.atan(h/w) * 180.0 / Math.PI).toFixed (2);
    return angle;
}
