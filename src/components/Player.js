import React, {useEffect, useRef, useState} from 'react';
import '../style/Player.css'
import {time_to_sec} from "../tools/TimeTransfer";

//歌词类
class LRC {
    time
    lyc
}
//这类需求时效性的对象不能用state保存，因为state是异步函数无法包装时效性。
let lock = true;
let now = -1;
//必须用var提升变量否则无法覆盖timer
var timer = null;
function Player(props) {
    const lrc = useRef();
    const [lyric_arr, setLyric_arr] = useState([]);
    let lycs = null;

//创建歌词
    function exec(lyric) {
        let lines = lyric.split("\n");
        const words = [];
        for (let i = 0; i < lines.length; i++) {
            //这一行的歌词
            let geci = {
                words: [],
                lyr: "",
                time: ""
            };
            //去掉空格
            lines[i] = lines[i].replace(/(^\s*)|(\s*$)/g, "");
            if (lines[i] === "") continue;
            let lrc_arr = lines[i].split("[");
            for (let j = 0; j < lrc_arr.length; j++) {
                //歌词对象
                let LYR = new LRC();
                //分割歌词
                let lrc = lrc_arr[j].split("]");
                if (lrc.length !== 1) {
                    LYR.time = lrc[0];
                    LYR.lyc = lrc[1];
                    //把字添加到这一行歌词中
                    geci.words.push(LYR);
                    //拼接歌词
                    geci.lyr += LYR.lyc;
                    if (j === 1)
                        geci.time = time_to_sec(LYR.time);
                }
            }
            words.push({words: geci.lyr, time: geci.time})
        }
        setLyric_arr(words);
    }
    //获取歌词
    function getLrc(url) {
        let xhr = new XMLHttpRequest();
        xhr.open('get', url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                //创建歌词
                exec(xhr.responseText);
                //不知道怎么做，只好延时给父组件传递歌词dom，必须延时否则报错
                setTimeout(() => {
                    lycs = document.querySelectorAll(".lyr");
                    props.setDom(lrc, lycs);
                    props.player.current.addEventListener("timeupdate", () => {
                        const arr = Array.from(lycs);
                        const info = isChange();
                        if (info !== undefined && info.change) {
                            now = info.index;
                            setActive(arr, info.index);
                            if (lock && (lycs[info.index].offsetTop - lrc.current.offsetTop) > lrc.current.offsetHeight / 2) {
                                lrc.current.scrollTo({
                                    top: lycs[info.index].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    });
                    //后台切回来自动跳转到正在播放的歌词
                    document.addEventListener("visibilitychange",()=>{
                        if(document.visibilityState === 'visible'){
                            lrc.current.scrollTo({
                                top: lycs[now].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                                behavior: 'smooth'
                            });
                        }
                    })
                }, 300)
            }
        }
        xhr.send(null);
    }

    //歌词滚动
    function setActive(arr, index) {
        arr.forEach(item => {
            item.classList.remove("active");
        });
        arr[index].classList.add("active");
    }

    //判断歌词是否正在播放的歌词 返回正在播放的歌词行数
    function isChange() {
        const arr = Array.from(lycs);

        for (let i = 0; i <= arr.length; i++) {
            if (arr[i] !== undefined &&
                Math.abs(
                    Number.parseFloat(arr[i].getAttribute("data-time")) - props.player.current.currentTime) < 0.2) {
                return {change: true, index: i}
            }
        }
    }

    //歌词点击
    function lyrClick(item, index) {
        lock = true;
        timer = null;
        const lyc = document.querySelectorAll(".lyr");
        props.player.current.currentTime = item.time;
        props.player.current.play();
        if ((lyc[index].offsetTop - lrc.current.offsetTop) > lrc.current.offsetHeight / 2) {
            lrc.current.scrollTo({
                top: lyc[index].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                behavior: 'smooth'
            });
        }
    }
    //组件初始化
    useEffect(() => {
        if (props.music !== "" || props.music !== undefined||true)
            //获取歌词 这是我的后端歌词接口
            getLrc(`https://kotokawa-akira-mywife.site/netDisk/downLoadForMusic?path=lyric/${props.music}.lrc`);
        lrc.current.scrollTo(0, 0);
    }, [props.music])

    //鼠标进入歌词 上锁，歌词不自动滚动
    function mouseOver() {
        lock = false;
    }
    //歌词手指触摸开始
    function lrcTouchStart(){
        lock = false;
        timer = null;
    }
    //歌词手指触摸结束 两秒后自动回滚到正在播放的歌词
    function lrcTouchEnd(){
        timer = setTimeout(()=>{
            lock = true;
            const lyc = document.querySelectorAll(".lyr");
            const lrc = document.querySelector(".lrc");
            if ((lyc[now].offsetTop - lrc.offsetTop) > lrc.offsetHeight / 2) {
                lrc.scrollTo({
                    top: lyc[now].offsetTop - lrc.offsetTop - lrc.offsetHeight / 2 + 50,
                    behavior: 'smooth'
                });
            }else{
                lrc.scrollTo({
                    top: lyc[now].offsetTop - lrc.offsetTop - lrc.offsetHeight / 2 + 50,
                    behavior: 'smooth'
                });
            }
        },2000)
    }
    //鼠标移除歌词 自动滚动到正在播放的歌词
    function mouseOut() {
        lock = true;
        const lyc = document.querySelectorAll(".lyr");
        const lrc = document.querySelector(".lrc");
        if ((lyc[now].offsetTop - lrc.offsetTop) > lrc.offsetHeight / 2) {
            lrc.scrollTo({
                top: lyc[now].offsetTop - lrc.offsetTop - lrc.offsetHeight / 2 + 50,
                behavior: 'smooth'
            });
        }else{
            lrc.scrollTo({
                top: lyc[now].offsetTop - lrc.offsetTop - lrc.offsetHeight / 2 + 50,
                behavior: 'smooth'
            });
        }
    }

    return (
        <div className={`player-page ${props.isShow ? "show-player-page" : null}`}>
            <div className={`pack-up`}>
                <svg onClick={() => props.setShow(false)} xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                     viewBox="0 0 24 24">
                    <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/>
                </svg>
            </div>
            <div className={`bgi`}>
                <img draggable={false}  className={props.music===""?'hide':null}
                     src={props.music===""?null:`https://kotokawa-akira-mywife.site/netDisk/getMusicImg?path=music%2F${props.music}.mp3`}
                     alt={`音乐背景`}/>
            </div>
            <div className={`player-page-main`}>
                <div className={`music-info-detail`}>
                    <div className={`img-mask`}></div>
                    <div className={`music-img`}>
                        <img draggable={false}  className={props.music===""?'hide':null}
                             src={props.music===""?null:`https://kotokawa-akira-mywife.site/netDisk/getMusicImg?path=music%2F${props.music}.mp3`}
                             alt={`歌曲封面`}/>
                    </div>
                    <div className={`music-info-detail-name`} title={props.music}>
                        {props.music===""?"没有歌曲":props.music}
                    </div>
                </div>
                <div className={`container`}>
                    <div ref={lrc} className={`lrc`} onMouseOver={mouseOver} onMouseLeave={mouseOut} onTouchStart={lrcTouchStart} onTouchEnd={lrcTouchEnd}>
                        {lyric_arr.map((item, index) => {
                            return (
                                <p className={`lyr`} data-time={item.time + ""}
                                   key={item.words + " - " + index}>
                                    <div className={`word`} onClick={() => lyrClick(item, index)}>
                                        {item.words}
                                    </div>

                                </p>
                            )
                        })}
                        <div className={`holder`}>
                            <div className={`${lyric_arr.length===0?null:'hide'}`}>没有歌词</div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default Player;