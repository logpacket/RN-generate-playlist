import axios from "axios";
import cheerio from "react-native-cheerio";

// const axios = require("axios");
// const cheerio = require("react-native-html-parser");

async function getHtml(search, detail){
    try{
        search = encodeURI(search);
        if(!detail)
            return await axios.get("https://www.melon.com/search/song/index.htm?q="+search);
        else
            return await axios.get("https://www.melon.com/song/detail.htm?songId="+search);
    } catch (e){
        console.error(e);
    }
}

async function getContentList(search){
    try{
        const songIdRegex = /[0-9]{8}/
        const contentList =[];
        const html = await getHtml(search);
        const $ = cheerio.load(html.data);
        const tableList = $("#frm_defaultList > div > table > tbody").children("tr");
        console.log(tableList);
        tableList.each((i, el)=>{
            const songIdData = $(el)
            .find("td:nth-child(3) div  div  a.btn.btn_icon_detail")
            .attr('href');

            const artistData = $(el)
            .find("#artistName > a")
            .text();
            const titleData = $(el)
            .find("td:nth-child(3) div div a.fc_gray b")
            .text();

            const albumData = $(el)
            .find("td:nth-child(5) div div a")
            .text();

            contentList[i] ={
                songId : songIdRegex.exec(songIdData)[0],
                artist : artistData,
                title : titleData,
                album :albumData
            };
        });
        return contentList;
    }catch(e){
        console.error(e);
    }
}

async function getContentDetail(songObject){
    try{
        const html = await getHtml(songObject.songId, true);
        const $ = cheerio.load(html.data);
        const imageUrl = $("#downloadfrm > div > div > div.thumb > a > img").attr('src');
        const genre = $("#downloadfrm > div > div > div.entry > div.meta > dl > dd:nth-child(6)")
        .text();

        return {
            songId : songObject.songId,
            artist : songObject.artist,
            title : songObject.title,
            album : songObject.album,
            imageUrl : imageUrl,
            genre : genre
        }
    }catch(e){
        console.error(e);
    }
}

function generatePlaylist(songId){
    return 'melonapp://play/?ctype=1&menuid=0&cid=' + songId;
}

getContentList("오랜 날 오랜 밤")

// export {getContentList, getContentDetail, generatePlaylist, getHtml};
