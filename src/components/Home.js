import React, {useEffect, useState} from 'react';
import "../style/Home.css"
import sort from "../tools/Sort";
import {MessagePlugin} from "tdesign-react";

function Home(props) {
    const [list, setList] = useState([]);

    //从服务器获取音乐列表
    function getMusicList() {
        //这是我的音乐后端路径
        fetch('https://kotokawa-akira-mywife.site/netDisk/getMusicList', {
            method: 'get'
        }).then(res => {
            return res.json();
        }).then(data => {
            const music_list = [];
            data.forEach(element => {
                //对歌曲名称进行分割 主要是去掉后缀
                let lst = element.split(".");
                let name = '';
                for (let i = 0; i < lst.length; i++) {
                    if (i !== lst.length - 1)
                        name += lst[i];
                    if(lst.length>2 &&i < lst.length - 2)
                        name +=".";
                }
                music_list.push({
                    name: name,
                    url: 'https://kotokawa-akira-mywife.site/netDisk/downLoadForMusic?path=music%2F' + element
                });
            });
            //歌曲按歌手名称存放
            setList(sort(music_list));
        })
    }
    //歌曲点击播放按钮
    function playClick(name) {
        addClick(name);
        setTimeout(() => {
            props.changeMusic(name);
        }, 200)
    }
    //添加到播放列表
    function addClick(name) {
        const list = [];
        let lock = false;
        for (let i = 0; i < props.musicList.length; i++) {
            if (props.musicList[i] === name) {
                lock = true;
            }
            list.push(props.musicList[i]);
        }
        if (!lock) list.unshift(name);
        props.setMusicList(list);
        MessagePlugin.success("已添加！", 2 * 1000);
        localStorage.setItem("music_list", JSON.stringify(list));
    }
    //初始化 获取音乐列表
    useEffect(() => {
        getMusicList();
    }, [])
    return (
        <div className={`home`}>
            <div className={`home-main`}>
                <div className={`home-main-ul`}>
                    {
                        list.map(item => {
                            return (
                                <div className={`home-main-li`} key={item.name}>
                                    <div className={`music-li-name`}>{item.name}</div>
                                    <div className={`music-li-option`}>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 viewBox="0 0 24 24" onClick={() => playClick(item.name)}>
                                                <path
                                                    d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5.146-9 4.854z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 viewBox="0 0 24 24" onClick={() => addClick(item.name)}>
                                                <path
                                                    d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default Home;