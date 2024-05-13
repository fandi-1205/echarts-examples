/*
title: Correlation Matrix (Scatter)
category: matrix
titleCN: 相关矩阵（散点图）
difficulty: 2
*/

const xCnt = 10;
const yCnt = 6;
const xData = [];
const yData = [];
for (let i = 0; i < xCnt; ++i) {
  xData.push({
    value: 'X' + (i + 1)
  });
}

for (let i = 0; i < yCnt; ++i) {
  yData.push({
    value: 'Y' + (i + 1)
  });
}

const data = [];
for (let i = 1; i <= xCnt; ++i) {
  for (let j = 1; j <= yCnt; ++j) {
    data.push(['X' + i, 'Y' + j, Math.random() * 2 - 1]);
  }
}

option = {
  matrix: {
    x: {
      data: xData
    },
    y: {
      data: yData
    },
    top: 80
  },
  visualMap: {
    type: 'continuous',
    min: -1,
    max: 1,
    dimension: 2,
    calculable: true,
    orient: 'horizontal',
    top: 5,
    left: 'center',
    inRange: {
      color: [
        '#313695',
        '#4575b4',
        '#74add1',
        '#abd9e9',
        '#e0f3f8',
        '#ffffbf',
        '#fee090',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026'
      ],
      symbolSize: [15, 40]
    }
  },
  series: {
    type: 'scatter',
    coordinateSystem: 'matrix',
    data,
    itemStyle: {
      opacity: 1
    },
    label: {
      show: true,
      formatter: (params) => params.value[2].toFixed(2)
    }
  }
};

