import { StatusBar } from 'expo-status-bar';
import React, {useState, useCallback } from 'react';
import {Alert, Button, Linking, StyleSheet, View, TextInput } from 'react-native';
import cheerio from "react-native-cheerio";
import axios from "axios";

async function getHtml(search, detail){
  try{
    encodeURI(search);
      if(!detail){
        return await axios.get("https://www.melon.com/search/total/index.htm?q="+search);
      }
      else
          return await axios.get("https://www.melon.com/song/detail.htm?songId="+search);
  } catch (e){
      console.error(e);
  }
}

async function getContentList(search){
  try{
      const songIdRegex = /[0-9]{8}/;
      const contentList =[];
      const html = await getHtml(search);
      const $ = cheerio.load(html.data);
      const tableList = $("table tbody").children("tr");
      tableList.each((i, el)=>{
          let songIdData = $(el)
          .find("td:nth-child(3) div div a.btn.btn_icon_detail");
          if(songIdData !== undefined){
            songIdData = songIdData.attr('href');
            songIdData = songIdRegex.exec(songIdData)[0];
          }

          let artistData = $(el)
          .find("#artistName > a");
          if(artistData !== undefined ){
            artistData = artistData.text();
          }

          let titleData = $(el)
          .find("td:nth-child(3) div div a.fc_gray b");
          if(titleData!== undefined ){
            titleData = titleData.text();
          }

          let albumData = $(el)
          .find("td:nth-child(5) div div a");
          if(albumData!== undefined){
            albumData = albumData.text();
          }

          contentList[i] = {
              songId : songIdData,
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
    if(songObject == undefined) return;
    else{
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
    }
      
  }catch(e){
      console.error(e);
  }
}

function generatePlaylist(songId){
  return 'melonapp://play/?ctype=1&menuid=0&cid=' + songId;
}

const OpenURLButton = ({ url, children }) => {
  const handlePress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, [url]);

  return <Button title={children} onPress={handlePress} />;
};

export default function App() {
  const [text, setText] = useState('');
  async function getContent(text){
    // const list = await getHtml(text);
    const list = await getContentList(text);
    const data = await getContentDetail(list[0]);
    let play;
    if(data !== undefined){
      play = generatePlaylist(data.songId);
      setText(play);
    }
  }
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={text=> {
          getContent(text);
        }}
      />
      <OpenURLButton url={text}>one click playlist</OpenURLButton>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input : {
    height : 30,
    borderColor : "#000",
    borderWidth : 1
  }
});
