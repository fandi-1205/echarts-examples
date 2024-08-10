/*
title: Dumbbell Plot
category: 'custom'
titleCN: 使用自定系列绘制哑铃图
difficulty: 2
*/

var rawData = [
  ['Gene1', 101.88, 80],
  ['Gene2', 155.8, 144.03],
  ['Gene3', 173.56,203.25],
  ['Gene4', 256, 120.5],
  ['Gene5', 200.89, 294.75],
  ['Gene6', 178.36, 233.24],
  ['Gene7', 356, 135.5],
  ['Gene8', 300, 95.5],
  ['Gene9', 400.36, 490.24],
  ['Gene10', 300.36, 243.24],

];
var categoryData = rawData.map(function (item) {
return item[0];
});

function renderItem(
  params: echarts.CustomSeriesRenderItemParams,
  api: echarts.CustomSeriesRenderItemAPI
): echarts.CustomSeriesRenderItemReturn {
  var start = api.coord([api.value(1), api.value(0)]);
  var end = api.coord([api.value(2), api.value(0)]);
  var lineColor = api.value(1) < api.value(2) ? '#91cc75' : '#5470c6';
  
  var lineShape = {
    x1: start[0],
    y1: start[1],
    x2: end[0],
    y2: end[1]
  };

  return {
    type: 'line',
    shape: lineShape,
    style: {
      stroke: lineColor
    }
  };
}

option = {
 title: {
   text: 'Gene Expression Levels',
   subtext: 'Comparison between Control and Patient Groups',
   left: 'center'
 },
 legend: {
   top: 45,
   data: ['Control', 'Patient']
 },
 xAxis: {
   type: 'value',
   min: 0,
   max: 500,
 },
 yAxis: {
   type: 'category',
   data: rawData.map((item) => item[0]),
 },
 series: [
   {
     type: 'custom',
     name: 'Genes',
     renderItem: renderItem,
     encode: {
       x: [1, 2],
       y: 0
     },
     z: 1,
     data: rawData
   },
   {
     name: 'Control',
     type: 'scatter',
     symbolSize: 10,
     itemStyle: {
       color: '#5470c6'
     },
     data: rawData.map((item) => item[1]),
     z: 2
   },
   {
     name: 'Patient',
     type: 'scatter',
     symbolSize: 10,
     itemStyle: {
       color: '#91cc75'
     },
     data: rawData.map((item) => item[2]),
     z: 2 
   }
 ]
};

export {};
