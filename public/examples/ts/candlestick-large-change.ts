/*
title: Candlestick Large Data Change
category: candlestick
titleCN: K线图 数据量过大的时候进行数据分组和图表切换
*/

const upColor = '#00da3c';
const downColor = '#ec0000';
const oneYearSpanMs: number = 31536000000;
const yearSpanMs = oneYearSpanMs * 0.6;

type RawData = number[][];

interface MonthData {
  totalOpen: number;
  totalClose: number;
  lowestLow: number;
  highestHigh: number;
  totalVolume: number;
  count: number;
  openPrices: number[];
  closePrices: number[];
  lowPrices: number[];
  highPrices: number[];
  volumes: number[];
};
interface WeekData {
  openSum: number;
  closeSum: number;
  low: number;
  high: number;
  volumeSum: number;
  count: number;
}

function splitData(rawData: number[][]) {
  let categoryData = [];
  let values = [];
  let volumes = [];
  for (let i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].splice(0, 1)[0]);
    values.push(rawData[i]);
    volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
  }

  return {
    categoryData: categoryData,
    values: values,
    volumes: volumes
  };
}
function calculateDataByMonth(rawData: RawData): RawData {
  const monthlyAverages: Record<string, MonthData> = {};
  
  rawData.forEach(([date, open, close, low, high, volume]) => {
    const yearMonth = new Date(date).toISOString().substring(0, 7);
    if (!monthlyAverages[yearMonth]) {
      monthlyAverages[yearMonth] = {
        totalOpen: 0,
        totalClose: 0,
        lowestLow: Infinity,
        highestHigh: -Infinity,
        totalVolume: 0,
        count: 0,
        openPrices: [],
        closePrices: [],
        lowPrices: [],
        highPrices: [],
        volumes: []
      };
    }

    const monthData = monthlyAverages[yearMonth];
    monthData.totalOpen += open;
    monthData.totalClose += close;
    monthData.lowestLow = Math.min(monthData.lowestLow, low);
    monthData.highestHigh = Math.max(monthData.highestHigh, high);
    monthData.totalVolume += volume;
    monthData.count++;
    monthData.openPrices.push(open);
    monthData.closePrices.push(close);
    monthData.lowPrices.push(low);
    monthData.highPrices.push(high);
    monthData.volumes.push(volume);
  });

  // 使用 Object.entries 来遍历 monthlyAverages 对象
  const processedData: any = Object.entries(monthlyAverages).map(([yearMonth, monthData]) => {
    const avgOpen = +(monthData.totalOpen / monthData.count).toFixed(2);
    const avgClose = +(monthData.totalClose / monthData.count).toFixed(2);
    const avgVolume = monthData.totalVolume / monthData.count;
    const minLow = Math.min(...monthData.lowPrices);
    const maxHigh = Math.max(...monthData.highPrices);
    
    // 使用月份字符串作为日期字段
    return [yearMonth, avgOpen, avgClose, minLow, maxHigh, avgVolume];
  });
  

  return processedData;
}

function calculateDataByWeek(rawData: RawData): RawData {
  const weeklyAverages = new Map<string, WeekData>();
  const processedData: any = [];

  rawData.forEach(([dateStr, open, close, low, high, volume]) => {
    const date = new Date(dateStr);
    const weekStartDate = getWeekStartDate(date);
    const weekKey = weekStartDate.toISOString().substring(0, 10);

    if (!weeklyAverages.has(weekKey)) {
      weeklyAverages.set(weekKey, {
        openSum: open,
        closeSum: close,
        low: low,
        high: high,
        volumeSum: volume,
        count: 1
      });
    } else {
      const weekData = weeklyAverages.get(weekKey)!;
      weekData.openSum += open;
      weekData.closeSum += close;
      weekData.low = Math.min(weekData.low, low);
      weekData.high = Math.max(weekData.high, high);
      weekData.volumeSum += volume;
      weekData.count++;
    }
  });

  weeklyAverages.forEach((weekData, weekKey) => {
    const avgOpen = +(weekData.openSum / weekData.count).toFixed(2);
    const avgClose =+(weekData.closeSum / weekData.count).toFixed(2) ;
    const avgVolume = weekData.volumeSum / weekData.count;

    // Push the data as a number array
    processedData.push([weekKey, avgOpen, avgClose, weekData.low, weekData.high, avgVolume]);
  });

  return processedData;
}

function getWeekStartDate(date: Date): Date {
  const dayOfWeek = date.getDay();
  const dayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjusting to Monday as the start of the week
  return new Date(date.setDate(date.getDate() + dayDiff));
}


function getCloseValue(data: Number[][]) {
  return data.map((d) => d[1]);
}
$.get(ROOT_PATH + '/data/asset/data/stock-DJI.json', function (rawData) {
  let dataByMonth = calculateDataByMonth(rawData);
  let dataByWeek = calculateDataByWeek(rawData);
  var data = splitData(rawData);
  var dataMonth = splitData(dataByMonth);
  var dataWeek = splitData(dataByWeek);
  var closeValue = getCloseValue(data.values);
  function adjustChart(startPercent:number, endPercent:number) {
    let currentDataSource = data.categoryData;

    const startIndex = Math.round(
      (startPercent * (currentDataSource.length - 1)) / 100
    );
    const endIndex = Math.round(
      (endPercent * (currentDataSource.length - 1)) / 100
    );

    const startValue = currentDataSource[startIndex];
    const endValue = currentDataSource[endIndex];
    // 将时间转换为Date对象
    const startDate = new Date(startValue);
    const endDate = new Date(endValue);
    const timeSpanMs = Math.abs(endDate.getTime() - startDate.getTime());
    if (timeSpanMs <= yearSpanMs) {
      const currentOption:any = myChart.getOption();
      currentOption.series[0].type = 'candlestick';
      currentOption.series[0].data = data.values;
      currentOption.xAxis[0].data = data.categoryData;
      myChart.setOption(currentOption, false);
    } else if (timeSpanMs > yearSpanMs && timeSpanMs <= yearSpanMs * 5) {
      const currentOption:any  = myChart.getOption();
      currentOption.series[0].type = 'candlestick';
      currentOption.series[0].data = dataWeek.values;
      currentOption.xAxis[0].data = dataWeek.categoryData;
      myChart.setOption(currentOption, false);
    } else if (timeSpanMs > yearSpanMs * 5 && timeSpanMs <= yearSpanMs * 15) {
      const currentOption:any  = myChart.getOption();
      currentOption.series[0].type = 'candlestick';
      currentOption.series[0].data = dataMonth.values;
      currentOption.xAxis[0].data = dataMonth.categoryData;
      myChart.setOption(currentOption, false);
    } else if (timeSpanMs > yearSpanMs * 15) {
      const currentOption:any  = myChart.getOption();
      currentOption.series[0].type = 'line';
      currentOption.series[0].data = closeValue;
      currentOption.series[0].showSymbol = false;
      currentOption.xAxis[0].data = data.categoryData;
      myChart.setOption(currentOption, false);
    }
  };
  
  myChart.setOption(
    (option = {
      animation: false,

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        textStyle: {
          color: '#000'
        },
        position: function (pos, params, el, elRect, size) {
          const obj: Record<string, number> = {
            top: 10
          };
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        }
        // extraCssText: 'width: 170px'
      },
      axisPointer: {
        link: [
          {
            xAxisIndex: 'all'
          }
        ],
        label: {
          backgroundColor: '#777'
        }
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: false
          },
          brush: {
            type: ['lineX', 'clear']
          }
        }
      },
      brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        outOfBrush: {
          colorAlpha: 0.1
        }
      },
      visualMap: {
        show: false,
        seriesIndex: 5,
        dimension: 2,
        pieces: [
          {
            value: 1,
            color: downColor
          },
          {
            value: -1,
            color: upColor
          }
        ]
      },
      grid: [
        {
          left: '10%',
          right: '8%',
          height: '50%'
        },
        {
          left: '10%',
          right: '8%',
          top: '63%',
          height: '16%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: {
            z: 100
          }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '85%',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'Dow-Jones index',
          type: 'candlestick',
          data: data.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: undefined,
            borderColor0: undefined
          }
        }
      ]
    }),
    true
  );
  const currentOption:any  = myChart.getOption();
  const startPercentInit = currentOption.dataZoom[1].start;
  const endPercentInit = currentOption.dataZoom[1].end;
  adjustChart(startPercentInit, endPercentInit);

  myChart.on('datazoom', function (params:any) {
    let startPercent;
    let endPercent;

    if (params.batch) {
      const zoomParams = params.batch[0];
      startPercent = zoomParams.start;
      endPercent = zoomParams.end;
    } else {
      startPercent = params.start;
      endPercent = params.end;
    }
    adjustChart(startPercent, endPercent);
  });



  myChart.dispatchAction({
    type: 'brush',
    areas: [
      {
        brushType: 'lineX',
        coordRange: ['2016-06-02', '2016-06-20'],
        xAxisIndex: 0
      }
    ]
  });
});

export {};
