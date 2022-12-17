const axios = require("axios");
const express = require("express");
const cheerio = require("cheerio");
const res = require("express/lib/response");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();

app.use(bodyParser.json());
app.use(cors());
dotenv.config();
app.use(
  bodyParser.urlencoded({
    extended: true,
    parameterLimit: 50000,
  })
);

// for (let i = 1; i < 390; i++)
//   fetchData(i).then((data) => {
//     return data;
//   });
const data1 = [];
let urlManga = "https://www.truyentranhlh.net/truyen-tranh/";
let datas = [];

const fetchData = async (id) => {
  try {
    const respone = await axios.get(
      `https://www.truyentranhlh.net/tim-kiem?sort=update&page=${id}`
    );
    const html = respone.data;
    const $ = cheerio.load(html);

    $(".thumb-item-flow.col-6.col-md-2").each((index, el) => {
      const data = $(el);
      //link
      const link = data.find("a").attr("href");
      const Id = data.find("div").attr("data-id");
      const img = data.find("div.content.img-in-ratio").attr("data-bg");
      datas.push({
        Link: link.slice(43),
        img: img,
      });
    });
    return datas;
  } catch (err) {
    console.error(err);
  }
};

let imageChapter = [];
let datas2 = [];

app.get("/lhManga/:chapters/:chap", (res, req) => {
  let url = urlManga + res.params.chapters + "/" + res.params.chap;
  console.log(url);
  try {
    axios.get(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $("div").each(function () {
        $(this)
          .find("img")
          .each(function () {
            imageChapter.push($(this).attr("data-src"));
          });
      });
      datas2.push({
        imgChap: imageChapter,
      });
    });
    req.status(200).json(datas2);
  } catch (err) {
    console.error(err);
  }
});

app.get("/lhManga/:chapters", (res, req) => {
  let url = urlManga + res.params.chapters;
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      let chapter = [];
      let chapterNumber = [];
      $(".row.d-md-table.w-md-100").each((index, el) => {
        const data = $(el);
        const title = data.find("span.series-name").text();
        const tags = data
          .find("span.info-value a span.badge.badge-info.bg-lhmanga.mx-1")
          .text();
        const time = data
          .find("div.row.statistic-list time.timeago")
          .attr("title");

        const fullDatas = data
          .find("div.col-4.statistic-item div.statistic-value")
          .text();
        const [days, timing] = fullDatas.split(" ");
        const views = fullDatas.split(" ")[3].slice(2);
        const summary = data.find("div.summary-content").text();
        const chapter_number = data
          .find("ul.list-chapters.at-series a")
          .attr("title");

        $("ul.list-chapters.at-series").each(function() {
          $(this).find("a div.chapter-name.text-truncate").each(function() {
            chapterNumber.push($(this).text().trim().split(" ")[1]);
          })
        })

        $("ul.list-chapters.at-series").each(function () {
          $(this)
            .find("a")
            .each(function () {
              chapter.push($(this).attr("href").split('/')[5]);
            });
        });

        const data_of_lhmanga = {
          title: title,
          tags: tags,
          days: days,
          time: timing,
          views: views,
          summary: summary,
          link: url.slice(43),
          chapter_number: chapterNumber,
          chapter_url: chapter,
        };
        data1.push(data_of_lhmanga);
      });
      console.log(data1);
      req.status(200).json(data1);
    });
  } catch (err) {
    console.error(err);
  }
});

//Routes
app.get("/lhManga", (res, req) => {
  try {
    for(let i = 1; i < 390; i++)
    fetchData(i);
    req.status(200).json(datas);
    // console.log(chapter);
  } catch (err) {
    console.error(err);
  }
});

//
app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running");
});
