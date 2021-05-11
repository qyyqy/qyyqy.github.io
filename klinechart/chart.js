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
    console.log('dpr', dpr)
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
    for(let i = 0; i < labelLength; i++) {
      if(i % xSplitNumber === 0) {
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

    for(let i = 0; i <= ySplitNumber; i ++) {
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
      }else {
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
      if(openItem > closeItem) {
        ctx.fillRect(xAxisCoord[i] - 8, Y0 - ratio * (openItem - minValue), 16, ratio * (openItem - closeItem));
      }else {
        ctx.fillRect(xAxisCoord[i] - 8, Y0 - ratio * (closeItem - minValue), 16, ratio * (closeItem - openItem));
      }
      ctx.restore();
    }
  }

  //绘制曲线
  drawCurve() {
    const ctx = this.ctx;

  }

}

