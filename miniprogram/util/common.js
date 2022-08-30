module.exports={
  //数量变化值
  getNumber(num){
    if(num<1000){
      return num;
    }else if(num>=1000 && num<10000){
      let n=(num/1000).toFixed(1)+"K"
      return n;
    }else if(num>=10000 && num<100000){
      let n=(num/10000).toFixed(1)+"W"
      return n;
    }else if(num>=100000){
      return "10W+";
    }else{
      return 0;
    }
  },

  //多功能时间戳转时间格式方式
  getTime(t, type=0){
    let time=new Date(t);
    let year=time.getFullYear()+"";
    let month=time.getMonth()+1;
    month=month<10 ? "0"+month : month+"";
    let day=time.getDate();
    day=day<10? "0"+day : day+"";
    let hours=time.getHours();
    hours=hours<10? "0"+hours : hours+"";
    let min=time.getMinutes();
    min=min<10? "0"+min : min+"";
    let second=time.getSeconds();
    second=second<10? "0"+second : second+"";

    let arr=[
      `${year}-${month}-${day}`,
      `${year}年${month}月${day}日`,
      `${year}-${month}-${day} ${hours}:${min}:${second}`,
      `${year}年${month}月${day}日 ${hours}时${min}分${second}秒`,
      `${month}-${day}`,
      `${month}月${day}日`,
      `${hours}:${min}:${second}`,
      `${hours}时${min}分${second}秒`
    ]
    return arr[type]
  }
}