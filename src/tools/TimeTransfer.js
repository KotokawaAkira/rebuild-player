//时间转换
const time_to_sec = function (time) {
    if(time===undefined) return ;
    let s = '';

    //let hour = time.split(':')[0];
    let min = time.split(':')[0];
    let sec = time.split(':')[1];

    s = /*Number(hour * 3600)*/ +Number.parseInt(min * 60) + Number.parseFloat(sec);

    return s;
};
function formatSeconds(value) {
    let result = parseInt(value)
    //let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
    let m = Math.floor((result / 60 % 60)) < 10 ? /*'0'*/ + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
    let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
    result = `${m}:${s}`
    return result
}
export {time_to_sec,formatSeconds};