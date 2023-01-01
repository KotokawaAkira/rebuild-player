import './App.css';
import 'tdesign-react/es/style/index.css';
import Player from "./components/Player";
import {formatSeconds} from "./tools/TimeTransfer";
import React, {useRef, useEffect, useState} from "react";
import {Drawer, Popup} from "tdesign-react";
import Home from "./components/Home";

let volume_now = 0.3;
let lock = false;
let lrc = null;
let lycs = null;

function App() {
    const player = useRef();
    const time_progress = useRef();
    const progress = useRef();
    const progress_out = useRef();
    const indicator = useRef();
    const volume_progress = useRef();
    const volume_progress_out = useRef();
    const current_time = useRef();
    const total_time = useRef();
    const [music, setMusic] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [volumeIcon, setVolumeIcon] = useState('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">\n' +
        '                                    <path d="M9 18h-7v-12h7v12zm2-12v12l11 6v-24l-11 6z"/></svg>')
    const [musicList, setMusicList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [now, setNow] = useState(0);
    const [showList, setShowList] = useState(false);

    //设置正在播放的歌词
    function setActive(arr, index) {
        arr.forEach(item => {
            item.classList.remove("active");
        });
        arr[index].classList.add("active")
    }

    //回调 用于接受子组件的dom（操作歌词）
    const setDom = (lrc1, lycs1) => {
        lrc = lrc1;
        lycs = lycs1;
    }

    //进度条点击事件
    function progressClick(e) {
        lock = true;
        const progress_music = (e.clientX-time_progress.current.offsetLeft) / progress_out.current.offsetWidth;
        player.current.currentTime = player.current.duration * progress_music;
        player.current.play();
        const arr = Array.from(lycs);
        for (let i = 0; i <= lycs.length; i++) {
            if (arr[i] !== undefined) {
                if(arr[i + 1]===undefined){
                    setActive(arr, i);
                    lrc.current.scrollTo({
                        top: arr[i].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                        behavior: 'smooth'
                    });
                }
                if (arr[i + 1]!==undefined&&player.current.currentTime > arr[i].getAttribute("data-time") && player.current.currentTime < arr[i + 1].getAttribute("data-time")) {
                    setActive(arr, i);
                    lrc.current.scrollTo({
                        top: arr[i].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                        behavior: 'smooth'
                    });
                    return;
                }
            }
        }
    }

    //进度条按下鼠标
    function progressMouseDown() {
        progress_out.current.onmousemove = progressMove;
        window.onmouseup = () => {
            progress_out.current.onmousemove = null;
            player.current.ontimeupdate = freshProgress;
        }
    }

    //进度条拖动
    function progressMove(e) {
        player.current.ontimeupdate = null;
        let percent = (e.clientX-time_progress.current.offsetLeft) / progress_out.current.offsetWidth;
        if(percent<0) percent=0;
        if(percent>1) percent=1;
        progress.current.style.setProperty("width", `${percent * 100}%`, "important")
        indicator.current.style.setProperty("left", `${percent * 100}%`, "important");
        current_time.current.innerText = formatSeconds(player.current.duration * percent);
        progress_out.current.addEventListener("touchend",()=>{
            player.current.currentTime = percent * player.current.duration;
            progress_out.current.removeEventListener("touchmove",touchTimeMove);
            player.current.ontimeupdate =  freshProgress;
            player.current.play();

            const arr = Array.from(lycs);
            for (let i = 0; i <= lycs.length; i++) {
                if (arr[i] !== undefined) {
                    if (player.current.currentTime > arr[i].getAttribute("data-time") && player.current.currentTime < arr[i + 1].getAttribute("data-time")) {
                        setActive(arr, i);
                        lrc.current.scrollTo({
                            top: arr[i].offsetTop - lrc.current.offsetTop - lrc.current.offsetHeight / 2 + 50,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        })
    }

    //时间进度条更新
    function freshProgress() {
        const p = player.current.currentTime / player.current.duration;
        current_time.current.innerText = formatSeconds(player.current.currentTime);
        progress.current.style.width = `${p * 100}%`
        indicator.current.style.left = `${p * 100}%`
    }

    //播放按钮点击事件
    function playClick() {
        lock = true;
        if (isPlaying)
            player.current.pause();
        else player.current.play();
    }

    //页面初始化
    useEffect(() => {
        //获取用户音量
        const volume = localStorage.getItem("volume");
        if (volume !== null) {
            volume_now = volume;
            player.current.volume = volume_now;
            volume_progress.current.style.width = player.current.volume * 100 + "%";
        }
        //获取用户音乐播放列表
        let music_list = [];
        const music_list_json = localStorage.getItem("music_list");
        if (music_list_json !== null) {
            music_list = JSON.parse(music_list_json);
        }
        setMusicList(music_list);
        //获取用户上次播放的音乐
        const current_music = localStorage.getItem("current_music");
        if (current_music !== null) setMusic(current_music);

        player.current.ontimeupdate = freshProgress;
        player.current.oncanplay = () => {
            total_time.current.innerText = formatSeconds(player.current.duration);
            progress_out.current.onclick = progressClick;
            progress_out.current.onmousedown = progressMouseDown;
            setIsLoading(false);
        }
        player.current.onplay = () => setIsPlaying(true);
        player.current.onpause = () => setIsPlaying(false);

        player.current.onwaiting = () => setIsLoading(true);

    }, [player])
    // 显示/隐藏 歌词界面
    function picClick() {
        setIsShow(!isShow);
    }
    //动态设置 播放/暂停 按钮图标
    function playIcon() {
        return isPlaying ? {__html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z"/></svg>'} : {__html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"/></svg>'}
    }

    //音量改变事件
    function volumeChange() {
        volume_progress.current.style.width = player.current.volume * 100 + "%";
        volumeIconChange();
        localStorage.setItem("volume", player.current.volume);
    }

    //音量轴鼠标移动
    function volumeMove(e) {
        let percent = (e.clientX - volume_progress_out.current.offsetLeft) / volume_progress_out.current.offsetWidth;
        if(percent<0) percent=0;
        if(percent>1) percent=1;
        volume_progress.current.style.width = `${percent*100}%`;
        player.current.volume = percent;
        volume_now = percent;
    }

    //音量轴鼠标按下
    function volumeDown() {
        volume_progress_out.current.addEventListener("mousemove", volumeMove);
        window.addEventListener("mouseup", () => volume_progress_out.current.removeEventListener("mousemove", volumeMove));
    }

    //点击音量轴
    function volumeClick(e) {
        const percent = (e.clientX - volume_progress_out.current.offsetLeft) / volume_progress_out.current.offsetWidth;
        player.current.volume = percent;
        volume_progress.current.style.width = `${percent * 100}%`;
    }

    //改变音量按钮
    function volumeIconChange() {
        const icon = player.current.volume === 0.0 ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M22 1.269l-18.455 22.731-1.545-1.269 3.841-4.731h-1.827v-10h4.986v6.091l2.014-2.463v-3.628l5.365-2.981 4.076-5.019 1.545 1.269zm-10.986 15.926v.805l8.986 5v-16.873l-8.986 11.068z"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">\n' +
            '                                    <path d="M9 18h-7v-12h7v12zm2-12v12l11 6v-24l-11 6z"/></svg>';
        setVolumeIcon(icon);
    }
    //静音事件
    function mute() {
        if (player.current.volume === 0)
            player.current.volume = volume_now;
        else {
            volume_now = player.current.volume;
            player.current.volume = 0.0;
        }
    }
    //切换音乐
    function changeMusic(item) {
        setMusic(item);
        localStorage.setItem("current_music", item);
    }

    //首次进入页面不自动播放
    useEffect(() => {
        if (lock)
            player.current.play();
        setNow(musicList.indexOf(music));
    }, [music])

    //音乐列表变化时重新计算当前歌曲的次序
    useEffect(() => {
        setNow(musicList.indexOf(music));
        player.current.onended = ()=>nextMusic();
    }, [musicList,now])

    //歌词窗弹出时 禁止页面滚动
    useEffect(() => {
        const body = document.querySelector("body");
        if (isShow)
            body.setAttribute("style", "overflow:hidden;");
        else
            body.setAttribute("style", "overflow:auto;");
    }, [isShow])

    //按钮上一首
    function preMusic() {
        lock = true;
        if (now === 0)
            changeMusic(musicList[musicList.length - 1])
        else
            changeMusic(musicList[now - 1])
    }
    //按钮 下一首
    function nextMusic() {
        lock = true;
        if (now === musicList.length - 1)
            changeMusic(musicList[0])
        else
            changeMusic(musicList[now + 1])
    }
    //播放列表移除音乐
    function removeMusic(name, index) {
        if (now === index) return;
        const list = [];
        musicList.forEach(item => {
            if (item !== name)
                list.push(item)
        });
        localStorage.setItem("music_list", JSON.stringify(list));
        setMusicList(list);
    }
    //手指触摸时间轴开始
    function touchTimeStart(){
        progress_out.current.addEventListener("touchmove",touchTimeMove);
        player.current.ontimeupdate = null;
    }
    //手指触摸时间轴移动
    function touchTimeMove(e){
        progressMove(e.touches[0]);
    }
    //触摸音量轴开始
    function touchVolumeStart(){
        volume_progress_out.current.addEventListener("touchmove",touchVolumeMove)
    }
    //触摸音量轴移动
    function touchVolumeMove(e){
        volumeMove(e.touches[0])
    }
    return (
        <div className="App">
            <div>
                <Home setMusicList={setMusicList} musicList={musicList} changeMusic={changeMusic} lock={lock}/>
                <Player music={music} player={player} setDom={setDom} isShow={isShow} setShow={setIsShow}
                        isLoading={isLoading}/>
            </div>
            <div className={`bottom-bar ${isShow ? 'bottom-bar-active' : null}`}>
                <div className={`loading-holder ${isLoading ? 'loading' : null}`}>加载中···</div>
                <div className={`player-out`}>
                    <div className={`player`}>
                        <div className={`time`}>
                            <div ref={current_time} className={`current-time`}>0:00</div>
                            <div className={`divide`}>/</div>
                            <div ref={total_time} className={`total-time`}>0:00</div>
                        </div>
                        <div ref={time_progress} className={`progress`}>
                            <div ref={progress_out} className={`progress-out`} onTouchStart={touchTimeStart}>
                                <div ref={progress} className={`progress-in`}></div>
                            </div>
                            <div ref={indicator} className={`indicator`} onMouseDown={progressMouseDown}></div>
                        </div>

                    </div>
                    <div className={`controls`}>
                        <div className={`music-info`} onClick={picClick} title={music} title={`点击显示歌词`}>
                            <div className={`pic-container`}>
                                <img className={music === "" ? 'hide' : null} draggable={false} alt={`歌曲封面`}
                                     src={music === "" ? null : `https://kotokawa-akira-mywife.site/netDisk/getMusicImg?path=music%2F${music}.mp3`}/>
                            </div>
                            <div className={`music-name`} title={music}>
                                {music === "" ? "没有歌曲" : music}
                            </div>
                        </div>

                        <div className={`play-controls`}>
                            <div className={`play-controls-button`} onClick={preMusic}
                                 dangerouslySetInnerHTML={{__html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path d="M4 2v20h-2v-20h2zm18 0l-16 10 16 10v-20z"/></svg>'}}></div>
                            <div className={`play-controls-button`} onClick={playClick}
                                 dangerouslySetInnerHTML={playIcon()}></div>
                            <div className={`play-controls-button`} onClick={nextMusic}
                                 dangerouslySetInnerHTML={{__html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path d="M20 22v-20h2v20h-2zm-18 0l16-10-16-10v20z"/></svg>'}}></div>
                        </div>
                        <div className={`controls-volume`}>
                            <div className={`volume-icon`} dangerouslySetInnerHTML={{__html: volumeIcon}}
                                 onClick={mute}>

                            </div>
                            <div ref={volume_progress_out} className={`volume-progress`} onClick={volumeClick}
                                 onMouseDown={volumeDown} onTouchStart={touchVolumeStart}>
                                <div ref={volume_progress} className={`volume-progress-inner`}></div>
                            </div>
                        </div>
                        <div className={`music-list`}>
                            <div className={`big-screen`}>
                                <Popup trigger="click" content={(
                                    <div className={`pop-ul`}>
                                        <div className={`${musicList.length === 0 ? null : 'hide'} pop-holder`}>没有歌曲~
                                        </div>
                                        {
                                            musicList.map((item, index) => {
                                                return <div className={`pop-li`} key={item}>
                                                    <div className={`pop-li-name ${index === now ? 'playing' : null}`}
                                                         title={item} onClick={() => changeMusic(item)}>
                                                        {item}
                                                    </div>
                                                    <div className={`remove`}>
                                                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"
                                                             fill-rule="evenodd" clip-rule="evenodd" onClick={() => removeMusic(item, index)}>
                                                            <path
                                                                d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                )}>
                                    <div
                                        dangerouslySetInnerHTML={{__html: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/></svg>'}}>
                                    </div>
                                </Popup>
                            </div>
                            <div className={`small-screen`} onClick={() => setShowList(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                                    <path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <audio style={{"position": "absolute", "bottom": "120px"}} ref={player}
                           onVolumeChange={volumeChange}
                           src={music === "" ? null : `https://kotokawa-akira-mywife.site/netDisk/downLoadForMusic?path=music%2F${music}.mp3`}/>
                </div>
            </div>
            <Drawer attach={`body`} placement={"bottom"} key={"bottom"} visible={showList} footer={null}
                    header={"音乐列表"} preventScrollThrough={true}  closeBtn={null}
                    onOverlayClick={()=>setShowList(false)}
            >
                <div className={`pop-ul`}>
                    <div className={`${musicList.length === 0 ? null : 'hide'} pop-holder`}>没有歌曲~
                    </div>
                    {
                        musicList.map((item, index) => {
                            return <div className={`pop-li`} key={item}>
                                <div className={`pop-li-name ${index === now ? 'playing' : null}`}
                                     title={item} onClick={() => changeMusic(item)}>
                                    {item}
                                </div>
                                <div className={`remove`}>
                                    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"
                                         fill-rule="evenodd" clip-rule="evenodd"
                                         onClick={() => removeMusic(item, index)}>
                                        <path
                                            d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z"/>
                                    </svg>
                                </div>
                            </div>
                        })
                    }
                </div>
            </Drawer>
        </div>
    );
}

export default App;
