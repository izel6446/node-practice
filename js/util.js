module.exports = class Util {
    /**
   * 아이디 생성 (소문자+숫자)
   *   ex) makeid(6,4)
   *      - aoskdj2048, jgirel8827, bmflwk3741 ...
   * @param {*} char_length 소문자 자리수
   * @param {*} num_length 숫자 자리수
   */
  static makeid(char_length, num_length) {
    var result           = '';
    const eng = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';

    for ( var i = 0; i < char_length; i++ ) {
      result += eng.charAt(Math.floor(Math.random() * char_length));
    }
    for ( var i = 0; i < num_length; i++ ) {
        result += num.charAt(Math.floor(Math.random() * num_length));
      }
    return result;
  }

   /**
   * 배열에서 임의의 요소 반환
   * @param {*} array 배열
   */
  static randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
  * min ~ max 사이의 임의의 정수 반환
  * @param {*} min 최솟값
  * @param {*} max 최댓값
  */
  static randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
  * 임의의 연령대 반환
  */
 static randomAge() { 
  return this.randomItem(['0~9세','10대','20대','30대','40대','50대','60대','70대 이상'])
  }

  /**
   * 임의의 IPv4 반환
   */
  static randomIpv4(){
    return (Math.floor(Math.random() * 255) + 1)+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255));

  }
}