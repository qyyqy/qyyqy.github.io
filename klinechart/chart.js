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

  /**
   *图表坐标转化为canvas画布坐标===================
   */

  //获取边界值
  getBounds() {
    //获取最大值
    let minVal = this.minValue;
    //获取最小值
    let maxVal = this.maxValue;
    //获取间隔数
    let ySplitNumber = this.ySplitNumber;
    //求边界值
    return getBounds(minVal, maxVal, ySplitNumber);
  }

  //1画布坐标等价于数值坐标的值
  eachYValue() {
    const { start, end } = this.getBounds();
    const yAxisHeight = this.H - this.origin[1] * 2;
    return (end - start) / yAxisHeight;
  }

  //获取所有横坐标
  getXCoords() {
    //获取X类目
    const xAxisLabel = this.xAxisLabel;
    //获取X坐标数
    const labelLength = xAxisLabel.length;
    //获取X坐标间距
    const xSpacing = this.getXSpacing();
    //图表的原点横坐标
    const X0 = this.origin[0];
    //求所有横坐标
    return Array.from({ length: labelLength }, (v, i) => X0 + xSpacing * i);
  }

  //计算X轴坐标间距
  getXSpacing() {
    //计算X轴的长度
    const xAxisWidth = this.W - this.origin[0] * 2;
    //获取X类目
    const xAxisLabel = this.xAxisLabel;
    //获取X坐标数
    const labelLength = xAxisLabel.length;

    return Math.round(xAxisWidth / labelLength);
  }

  //获取要显示的纵坐标
  getYCoords() {
    //获取边界值
    const { end, each } = this.getBounds();
    //获取间隔数
    let ySplitNumber = this.ySplitNumber;
    //求所有要显示的坐标点
    return Array.from({ length: ySplitNumber }, (v, i) => end - i * each);
  }

  //值转化为Y坐标
  transYCoords(data) {
    const eachYValue = this.eachYValue();
    const { end } = this.getBounds();
    let Y0 = this.origin[1];
    let Y = (end - data) / eachYValue;
    return Y0 + Y;
  }

  /**
   *canvas画布坐标转化为图表坐标===================
   */
  transToValue(Y) {
    const eachYValue = this.eachYValue();
    let Y0 = this.origin[1];
    const { end } = this.getBounds();
    let valueY = end - (Y - Y0) * eachYValue;
    valueY = valueY.toFixed(2);
    return valueY;
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
    this.drawCandlestick();
    this.drawCurve();
    // this.drawLegends();
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
    const lineStyle = {
      color: '#D9D9D9',
    };
    //绘制X轴
    const XLine = [
      { x: X0, y: Y1 },
      { x: X1, y: Y1 },
    ];
    drawLine(ctx, XLine, lineStyle);
    //绘制Y轴
    const YLine = [
      { x: X0, y: Y0 },
      { x: X0, y: Y1 },
    ];
    drawLine(ctx, YLine, lineStyle);
  }

  //绘制X轴坐标点
  drawXLabels() {
    const ctx = this.ctx;
    const xCoords = this.getXCoords();
    const xAxisLabel = this.xAxisLabel;
    const xSplitNumber = this.xSplitNumber;
    //Y轴坐标
    const Y0 = this.H - this.origin[1];
    //文字起点Y坐标
    const y = Y0 + 6;
    //设置文字样式
    const textStyle = {
      textAlign: 'center',
      color: '#D9D9D9',
      font: '12px PingFang-SC Arial',
      textBaseline: 'top',
    };
    for (let i = 0; i < xCoords.length; i++) {
      let x = xCoords[i];
      if (i % xSplitNumber === 1) {
        //绘制文本
        drawText(ctx, xAxisLabel[i], { x, y }, textStyle);
        //绘制刻度
        drawLine(
          ctx,
          [
            { x, y: Y0 },
            { x, y: Y0 + 4 },
          ],
          { color: '#D9D9D9' }
        );
      }
    }
  }

  //绘制Y轴坐标点
  drawYLabels() {
    const ctx = this.ctx;
    const yCoords = this.getYCoords();
    const x = this.origin[0];
    const X1 = this.W - this.origin[0];
    for (let i = 0; i < yCoords.length; i++) {
      let y = this.transYCoords(yCoords[i]);
      const textStyle = {
        textBaseline: 'middle',
        textAlign: 'right',
        color: '#D9D9D9',
      };
      //绘制文本
      drawText(ctx, yCoords[i], { x: x - 8, y }, textStyle);
      //绘制刻度
      drawLine(
        ctx,
        [
          { x, y },
          { x: x - 4, y },
        ],
        { color: '#D9D9D9' }
      );
      //绘制分割线
      drawLine(
        ctx,
        [
          { x, y },
          { x: X1, y },
        ],
        { color: '#666' }
      );
    }
  }

  //绘制蜡烛图
  drawCandlestick() {
    const ctx = this.ctx;
    const xCoords = this.getXCoords();
    const data = this.data;

    for (let i = 0; i < data.length; i++) {
      let x = xCoords[i];
      //开盘价
      let open = data[i][0];
      //收盘价
      let close = data[i][1];
      //最低价
      let lowest = data[i][2];
      //最高价
      let highest = data[i][3];
      //绘制最高最低价
      //   drawLine(
      //     ctx,
      //     [
      //       { x, y: this.transYCoords(lowest) },
      //       { x, y: this.transYCoords(highest) },
      //     ],
      //     {
      //       color: getColor(open, close),
      //     }
      //   );
      let height = Math.abs(this.transYCoords(open) - this.transYCoords(close));
      let Y0 = Math.max(open, close);
      let y = this.transYCoords(Y0);
      //设置矩形样式
      const rectStyle = {
        background: getColor(open, close),
        width: 12,
        height,
      };
      //绘制开盘收盘矩形
      setTimeout(() => {
        drawLine(
          ctx,
          [
            { x, y: this.transYCoords(lowest) },
            { x, y: this.transYCoords(highest) },
          ],
          {
            color: getColor(open, close),
          }
        );
        drawRect(ctx, { x: x - rectStyle.width / 2, y }, rectStyle);
      }, 200 * i);
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

    //绘制收盘曲线
    let closeData = data.map((item) => item[1]);
    let closePoints = this.getLinePoints(closeData);
    this.drawCurvePath(closePoints, '#D9D9D9');
  }

  //获取曲线坐标点
  getLinePoints(data) {
    //获取X坐标
    const xCoords = this.getXCoords();
    let points = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i]) {
        points.push({
          x: xCoords[i],
          y: this.transYCoords(data[i]),
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
    ctx.lineWidth = 1;
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
    const X0 = this.W - this.origin[0];
    ctx.save();
    ctx.font = '16px PingFang-SC Arial';
    ctx.fillStyle = '#666666';
    for (let l = 0; l < legends.length; l++) {
      const metrics =
        ctx.measureText(legends[l].text).width + 20 * (legends.length - l);
      ctx.fillText(
        legends[l].text,
        X0 - metrics * (legends.length - l),
        this.H
      );
      ctx.beginPath();
      ctx.strokeStyle = legends[l].color;
      ctx.moveTo(X0 - metrics * (legends.length - l) - 10, this.H - 8);
      ctx.lineTo(X0 - metrics * (legends.length - l) - 50, this.H - 8);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  }
}

class crossLayer extends Chart {
  constructor(canvas) {
    super(canvas);
  }

  create() {
    this.xSpacing = this.getXSpacing();
  }

  handleMouseMove(e) {
    let X = e.offsetX;
    let Y = e.offsetY;
    // this.pageX = e.pageX;
    // this.pageY = e.pageY;
    this.clear();
    this.drawCrossHair(X, Y);
  }

  //绘制十字光标
  drawCrossHair(X, Y) {
    let ctx = this.ctx;
    const xCoords = this.getXCoords();
    const xSpacing = this.xSpacing;

    if (
      X < this.origin[0] ||
      X > this.W - this.origin[0] ||
      Y < this.origin[1] - 0.5 ||
      Y > this.H - this.origin[1] + 0.5
    ) {
      return false;
    }

    let X0 = this.origin[0];
    let X1 = this.W - this.origin[0];
    let Y0 = this.origin[1];
    let Y1 = this.H - this.origin[1];
    const lineStyle = { color: '#D9D9D9', type: 'dash', opt: [4, 2] };
    let horizon = [
      { x: X0, y: Y },
      { x: X1, y: Y },
    ];
    //绘制光标横线
    drawLine(ctx, horizon, lineStyle);
    //设置文本样式
    let valueY = this.transToValue(Y);
    const padding = 4;
    const height = 24;
    const textWidth = ctx.measureText(valueY).width + padding * 2;
    const textRectStyle = {
      color: '#D9D9D9',
      background: '#21262D',
      lineHeight: height,
      padding,
      textAlign: 'right',
      textBaseline: 'middle',
      font: '12px PingFang-SC Arial',
      width: textWidth,
      height
    };
    drawTextRect(ctx, valueY, { x: X0 - textWidth - 4, y: Y - height/2 }, textRectStyle);

    //绘制光标竖线
    let idx = Math.round((X - X0) / xSpacing);
    let valueX = this.xAxisLabel[idx];
    let vertical = [
      { x: xCoords[idx], y: Y0 },
      { x: xCoords[idx], y: Y1 },
    ];
    drawLine(ctx, vertical, lineStyle);
    drawTextRect(ctx, valueX, { x: xCoords[idx] - textWidth/2, y: Y1 + 6 }, textRectStyle);

    //绘制提示框
    //drawTooltip(this.data[idx], { x:this.pageX, y:this.pageY });
  }

  //清除画布
  clear() {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
  }
}

/**
 *
 * 获取边界值
 * @param {*} minVal
 * @param {*} maxVal
 * @param {*} n
 * @returns
 */
function getBounds(minVal, maxVal, n) {
  let min = minVal - parseInt(minVal % 100);
  let max = maxVal;
  let each = Math.ceil((max - min) / n); //向上取整

  let start = parseInt(min);
  let end = start + each * n;

  return { start, end, each };
}

/**
 * 获取颜色
 *
 * @param {*} a
 * @param {*} b
 * @returns
 */
function getColor(a, b) {
  return a >= b ? '#00C000' : '#FF0020';
}

/**
 * 绘制直线
 *
 * @param {*} ctx
 * @param {*} [start, end]
 * @param {*} lineStyle
 */
function drawLine(ctx, [start, end], lineStyle) {
  ctx.save();
  ctx.beginPath();
  //设置线的颜色
  const { color, type, opt } = lineStyle;
  ctx.strokeStyle = lineStyle.color;
  if (type == 'dash') {
    ctx.setLineDash(lineStyle.opt);
  } else {
    ctx.setLineDash([]);
  }
  //开始绘制
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

/**
 * 绘制文本
 *
 * @param {*} ctx
 * @param {*} text
 * @param {*} point
 * @param {*} textStyle
 */
function drawText(ctx, text, point, textStyle) {
  ctx.save();
  const { color, textAlign, textBaseline, font } = textStyle;
  ctx.textAlign = textAlign;
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseline = textBaseline;
  ctx.fillText(text, point.x, point.y);
  ctx.restore();
}

/**
 * 绘制矩形
 *
 * @param {*} ctx
 * @param {*} text
 * @param {*} point
 * @param {*} rectStyle
 */
function drawRect(ctx, point, rectStyle) {
  ctx.save();

  const { background, width, height } = rectStyle;

  ctx.fillStyle = background;
  ctx.fillRect(point.x, point.y, width, height);

  ctx.restore();
}

/**
 * 绘制文本矩形
 *
 * @param {*} ctx
 * @param {*} val
 * @param {*} point
 * @param {*} textRectStyle
 */
function drawTextRect(ctx, val, point, textRectStyle) {
  ctx.save();
  const {
    color,
    padding,
    background,
    textAlign,
    textBaseline,
    lineHeight,
    font,
    width,
    height
  } = textRectStyle;
  ctx.font = font;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  ctx.fillStyle = background;
  ctx.setLineDash([]);
  ctx.strokeStyle = '#D9D9D9';
  ctx.strokeRect(
    point.x,
    point.y,
    width + 20,
    height
  );
  ctx.fillRect(
    point.x,
    point.y,
    width + 20,
    height
  );
  ctx.fillStyle = color;
  ctx.fillText(val, point.x + width + 20, point.y + height/2);

  //ctx.stroke();
  ctx.closePath();
  ctx.restore();
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

//绘制提示框
function createTooltip(elem) {
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.style = 'position:absolute;z-index:999;background:orange;';
  elem.parentNode.appendChild(tooltip);
}

function drawTooltip(txt, { x, y }) {
  const tooltip = document.getElementsByClassName('tooltip')[0];
  console.log(tooltip, txt);
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.innerHTML = txt;
}