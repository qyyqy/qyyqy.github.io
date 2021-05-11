//获取设备像素比
const dpr = window.devicePixelRatio || 1;

class Chart {
  constructor(canvas) {
    //初始化画布宽高
    this.W = 0;
    this.H = 0;
    //获取canvas
    this.canvas = document.getElementById(canvas);
    //canvas渲染上下文
    this.ctx = this.canvas.getContext('2d');
    //设置坐标原点
    this.origin = [60, 60];
    //配置X轴标签
    this.xAxisLabel = [];
    //配置Y轴标签
    this.yAxisLabel = [];
    //配置splitNumber
    this.xSplitNumber = 6;
    //
  }

  init(opt) {
    Object.assign(this, opt);
    console.log('dpr', dpr);
    //防止画布图像模糊
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.scale(dpr, dpr);
    //创建图表
    this.create();
  }
}

class KLine extends Chart {
  constructor(canvas) {
    super(canvas);
  }

  create() {
    this.drawAxis();
    this.drawXLabels();
    this.drawYLabels();
    this.drawData();
    this.drawCurve();
    this.drawLegends();
  }

  //绘制坐标系
  drawAxis() {
    const ctx = this.ctx;
    //起点坐标
    const X0 = this.origin[0];
    const Y0 = this.origin[1];
    //终点坐标
    const X1 = this.W - X0;
    const Y1 = this.H - Y0;
    ctx.save();
    ctx.beginPath();
    //设置线的颜色
    ctx.strokeStyle = '#0557AC';
    //开始绘制
    ctx.moveTo(X0, Y0);
    ctx.lineTo(X0, Y1);
    ctx.lineTo(X1, Y1);
    ctx.stroke();
    ctx.closePath();
  }

  //绘制X轴坐标点
  drawXLabels() {
    const ctx = this.ctx;
    //获取X类目
    const xAxisLabel = this.xAxisLabel;
    //获取X坐标数
    const labelLength = xAxisLabel.length;
    //计算X轴的长度
    const xAxisWidth = this.W - this.origin[0] * 2;
    //计算坐标间距
    const xSpacing = Math.round(xAxisWidth / labelLength);
    //获取分割数
    const xSplitNumber = this.xSplitNumber;
    //起点坐标
    const X0 = this.origin[0];
    const Y0 = this.H - this.origin[1] + 6;
    //设置文字样式
    ctx.textAlign = 'center';
    ctx.fillStyle = '#005FC3';
    ctx.font = '12px PingFang-SC Arial';
    ctx.textBaseline = 'top';
    //绘制坐标点
    const xAxisCoord = [];
    for (let i = 0; i < labelLength; i++) {
      if (i % xSplitNumber === 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#D9D9D9';
        ctx.moveTo(X0 + xSpacing * (i + 1), Y0 - 6);
        ctx.lineTo(X0 + xSpacing * (i + 1), this.origin[1]);
        ctx.fillText(xAxisLabel[i], X0 + xSpacing * (i + 1), Y0);
        ctx.stroke();
        ctx.closePath();
      }
      xAxisCoord.push(X0 + xSpacing * (i + 1));
    }
    this.xAxisCoord = xAxisCoord;
  }

  //绘制Y轴坐标点
  drawYLabels() {
    const ctx = this.ctx;
    //获取最大最小值
    let minValue = this.minValue.toFixed(0);
    minValue = minValue - parseInt(minValue % 100);
    this.minValue = minValue;
    let maxValue = this.maxValue.toFixed(0);
    maxValue = maxValue - parseInt(maxValue % 100) + 40;
    const ySplitNumber = this.ySplitNumber;
    //计算每格的值
    const diffValue = Math.round(maxValue - minValue);
    const eachYValue = Math.round(diffValue / ySplitNumber);
    this.eachYValue = eachYValue;
    //计算X轴的长度
    const yAxisHeight = this.H - this.origin[1] * 2;
    //计算坐标间距
    const ySpacing = Math.round(yAxisHeight / ySplitNumber);
    this.ySpacing = ySpacing;
    //起点坐标
    const X0 = this.origin[0];
    const X1 = this.W - X0;
    const Y0 = this.H - this.origin[1];
    //绘制Y坐标点
    console.log('66', ySpacing);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySplitNumber; i++) {
      ctx.beginPath();
      ctx.strokeStyle = '#D9D9D9';
      ctx.moveTo(X0, Y0 - (i + 1) * ySpacing);
      ctx.lineTo(X1, Y0 - (i + 1) * ySpacing);
      ctx.fillText(minValue + i * eachYValue, X0 - 6, Y0 - i * ySpacing);
      ctx.stroke();
      ctx.closePath();
    }
  }

  //绘制数据
  drawData() {
    const ctx = this.ctx;
    ctx.save();
    let data = this.data;
    const ySpacing = this.ySpacing;
    const eachYValue = this.eachYValue;
    //1单位的坐标量
    const ratio = ySpacing / eachYValue;
    this.ratio = ratio;
    console.log(ySpacing, eachYValue);
    const minValue = this.minValue;
    const xAxisCoord = this.xAxisCoord;
    const Y0 = this.H - this.origin[1];
    for (let i = 0; i < data.length; i++) {
      let openItem = data[i][0];
      let closeItem = data[i][1];
      let lowestItem = data[i][2];
      let highestItem = data[i][3];
      if (openItem > closeItem) {
        ctx.strokeStyle = ctx.fillStyle = '#00C000'; //设置线的颜色
      } else {
        ctx.strokeStyle = ctx.fillStyle = '#FF0020'; //设置线的颜色
      }
      //console.log('fg', xAxisCoord[i],ctx.strokeStyle, openItem, closeItem);
      //绘制高低线
      ctx.beginPath();
      ctx.moveTo(xAxisCoord[i], Y0 - ratio * (lowestItem - minValue));
      ctx.lineTo(xAxisCoord[i], Y0 - ratio * (highestItem - minValue));
      ctx.closePath();
      ctx.stroke();
      //console.log('fg2', xAxisCoord[i],ctx.strokeStyle, openItem, closeItem, lowestItem, highestItem);
      //绘制矩形
      if (openItem > closeItem) {
        ctx.fillRect(
          xAxisCoord[i] - 8,
          Y0 - ratio * (openItem - minValue),
          16,
          ratio * (openItem - closeItem)
        );
      } else {
        ctx.fillRect(
          xAxisCoord[i] - 8,
          Y0 - ratio * (closeItem - minValue),
          16,
          ratio * (closeItem - openItem)
        );
      }
      ctx.restore();
    }
  }

  //绘制曲线 TODO:MA5\MA10\MA20\MA30
  drawCurve() {
    let data = this.data;
    let MA5 = calculateMA(data, 5);
    let MA10 = calculateMA(data, 10);
    let MA20 = calculateMA(data, 20);
    // let MA30  = calculateMA(data, 30);
    //console.log(data, MA5, MA10, MA20, MA30);
    let MA5Points = this.getLinePoints(MA5);
    let MA10Points = this.getLinePoints(MA10);
    let MA20Points = this.getLinePoints(MA20);

    //绘制MA线路径
    this.drawCurvePath(MA5Points, '#00AAB6');
    this.drawCurvePath(MA10Points, '#FA0092');
    this.drawCurvePath(MA20Points, '#24359B');
  }

  getLinePoints(data) {
    //获取X坐标
    const xAxisCoord = this.xAxisCoord;
    const Y0 = this.H - this.origin[1];
    const ratio = this.ratio;
    const minValue = this.minValue;
    let points = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i]) {
        points.push({
          x: xAxisCoord[i],
          y: Y0 - ratio * (data[i] - minValue),
        });
      }
    }
    return points;
  }

  //绘制曲线路径
  drawCurvePath(points, lineColor) {
    const ctx = this.ctx;
    //获取控制点
    let controlPoints = getControlPoint(points);
    //console.log('control', controlPoints);
    let int = 0;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor; //设置线的颜色
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length; i++) {
      if (i == 0) {
        ctx.quadraticCurveTo(
          controlPoints[0].x,
          controlPoints[0].y,
          points[1].x,
          points[1].y
        );
        int = int + 1;
      } else if (i < points.length - 2) {
        ctx.bezierCurveTo(
          controlPoints[int].x,
          controlPoints[int].y,
          controlPoints[int + 1].x,
          controlPoints[int + 1].y,
          points[i + 1].x,
          points[i + 1].y
        );
        int += 2;
      } else if (i == points.length - 2) {
        ctx.quadraticCurveTo(
          controlPoints[controlPoints.length - 1].x,
          controlPoints[controlPoints.length - 1].y,
          points[points.length - 1].x,
          points[points.length - 1].y
        );
      }
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  //绘制图例
  drawLegends() {
    const legends = this.legends;
    const ctx = this.ctx;
    const X0 = this.W- this.origin[0];
    ctx.save();
    ctx.font = '16px PingFang-SC Arial';
    ctx.fillStyle = '#666666';
    for(let l = 0;l < legends.length;l++){
      const metrics = ctx.measureText(legends[l].text).width + 20 * (legends.length-l);
      ctx.fillText(legends[l].text, X0 - metrics*(legends.length - l), this.H);
      ctx.beginPath();
      ctx.strokeStyle = legends[l].color;
      ctx.moveTo(X0 - metrics*(legends.length - l)-10, this.H - 8);
      ctx.lineTo(X0 - metrics*(legends.length - l )- 50, this.H - 8);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }
}

//计算MA值
function calculateMA(data, num) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < num) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (var j = 0; j < num; j++) {
      sum += data[i - j][1]; //收盘
    }
    result.push(sum / num);
  }
  return result;
}

//获取控制点
function getControlPoint(points) {
  let rt = 0.3;
  let count = points.length - 2;
  let arr = [];
  for (let i = 0; i < count; i++) {
    //获取三个点的坐标
    let P0 = points[i];
    let P1 = points[i + 1];
    let P2 = points[i + 2];
    let v1 = new Vector(P0.x - P1.x, P0.y - P1.y);
    let v2 = new Vector(P2.x - P1.x, P2.y - P1.y);
    let v1Len = v1.length(); //线段P0P1的长
    let v2Len = v2.length(); //线段P1P2的长
    let centerV = v1.normalize().add(v2.normalize()).normalize();
    let ncp1 = new Vector(centerV.y, centerV.x * -1);
    let ncp2 = new Vector(centerV.y * -1, centerV.x);
    if (ncp1.angle(v1) < 90) {
      let p1 = ncp1.multiply(v1Len * rt).add(P1);
      let p2 = ncp2.multiply(v2Len * rt).add(P1);
      arr.push(p1, p2);
    } else {
      let p1 = ncp1.multiply(v2Len * rt).add(P1);
      let p2 = ncp2.multiply(v1Len * rt).add(P1);
      arr.push(p2, p1);
    }
  }
  return arr;
}

//构造矢量
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  normalize() {
    let inv = 1 / this.length() == Infinity ? 0 : 1 / this.length();
    return new Vector(this.x * inv, this.y * inv);
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }
  multiply(f) {
    return new Vector(this.x * f, this.y * f);
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  angle(v) {
    return (
      (Math.acos(this.dot(v) / (this.length() * v.length())) * 180) / Math.PI
    );
  }
}
