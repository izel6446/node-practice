class JsUtil {
  static callAjax(method, url, callback){
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open(method, url, true);
    xmlhttp.send();
  }

  static getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { params[key] = value; });
    return params;
  }

  static ColorUtil = class {
    color_array = [];
    constructor(data){
      for(let i=0;i<data.length;i++){
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        this.color_array.push(`rgba(${r}, ${g}, ${b}, $OPACITY)`);
      }
    }

    randomColorWithOpacity(opacity){
      const rtn = this.color_array.map(x => x.replace("$OPACITY",opacity));
      return rtn;
    }
  }
}